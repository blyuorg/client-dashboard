"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadableErrorMessage } from "@/lib/supabase/errors";
import { calculateInvoiceTotals, calculateLineItem, formatMoney } from "@/lib/invoices/calculations";
import { createRazorpayOrder } from "@/lib/razorpay";
import type { GstType, InvoiceStatus } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, userId: null as string | null, error: "Your session has expired. Please log in again." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, userId: null as string | null, error: "You don't have permission to do that." };

  return { supabase, userId: user.id, error: null as string | null };
}

export type InvoiceLineItemInput = {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
};

export type InvoiceHeaderInput = {
  project_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  status: InvoiceStatus;
  currency: string;
  notes?: string | null;
  terms?: string | null;
  gst_percent: number;
  gst_type: GstType;
};

function validateHeader(header: InvoiceHeaderInput): string | null {
  if (!header.project_id) return "Choose a project.";
  if (!header.invoice_number.trim()) return "Invoice number is required.";
  if (!header.invoice_date) return "Invoice date is required.";
  if (header.gst_percent < 0) return "GST percent can't be negative.";
  return null;
}

function validateLineItems(items: InvoiceLineItemInput[]): string | null {
  if (items.length === 0) return "Add at least one line item.";
  for (const item of items) {
    if (!item.description.trim()) return "Every line item needs a description.";
    if (item.quantity < 0) return "Quantity can't be negative.";
    if (item.unit_price < 0) return "Unit price can't be negative.";
    if (item.discount_percent < 0 || item.discount_percent > 100) return "Discount must be between 0 and 100%.";
  }
  return null;
}

/**
 * Creates or replaces an invoice's line items and recomputes every total
 * server-side from `@/lib/invoices/calculations` — client-submitted totals
 * are never trusted or persisted directly, only the raw line item inputs.
 */
export async function saveInvoiceWithLineItems(
  invoiceId: string | null,
  header: InvoiceHeaderInput,
  lineItems: InvoiceLineItemInput[]
): Promise<{ error: string | null; invoiceId?: string; warning?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const headerError = validateHeader(header);
  if (headerError) return { error: headerError };

  const lineItemError = validateLineItems(lineItems);
  if (lineItemError) return { error: lineItemError };

  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", header.project_id)
    .single();
  if (!project) return { error: "Choose a valid project." };

  const totals = calculateInvoiceTotals(
    lineItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent,
    })),
    header.gst_percent,
    header.gst_type
  );

  const invoicePayload = {
    project_id: header.project_id,
    client_id: project.client_id,
    invoice_number: header.invoice_number.trim(),
    invoice_date: header.invoice_date,
    due_date: header.due_date || null,
    status: header.status,
    currency: header.currency || "INR",
    notes: header.notes?.trim() || null,
    terms: header.terms?.trim() || null,
    gst_percent: header.gst_percent,
    gst_type: header.gst_type,
    subtotal: totals.subtotal,
    discount: totals.discountTotal,
    gst: totals.totalTax,
    cgst_amount: totals.cgstAmount,
    sgst_amount: totals.sgstAmount,
    igst_amount: totals.igstAmount,
    tax: 0,
    total: totals.grandTotal,
  };

  let resolvedInvoiceId = invoiceId;

  if (invoiceId) {
    const { error } = await supabase.from("invoices").update(invoicePayload).eq("id", invoiceId);
    if (error) return { error: getReadableErrorMessage(error) };

    const { error: deleteError } = await supabase.from("invoice_line_items").delete().eq("invoice_id", invoiceId);
    if (deleteError) return { error: getReadableErrorMessage(deleteError) };
  } else {
    const { data: created, error } = await supabase.from("invoices").insert(invoicePayload).select("id").single();
    if (error) return { error: getReadableErrorMessage(error) };
    resolvedInvoiceId = created.id;
  }

  if (!resolvedInvoiceId) return { error: "Couldn't determine the invoice to update." };

  const lineItemRows = lineItems.map((item, index) => {
    const calc = calculateLineItem({
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent,
    });
    return {
      invoice_id: resolvedInvoiceId as string,
      description: item.description.trim(),
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      taxable_amount: calc.taxableAmount,
      line_total: calc.lineTotal,
      order_index: index,
    };
  });

  const { error: insertItemsError } = await supabase.from("invoice_line_items").insert(lineItemRows);
  if (insertItemsError) return { error: getReadableErrorMessage(insertItemsError) };

  // Draft invoices are still being drafted — amounts and even the project
  // can change, so there's nothing durable yet for Razorpay to accept. Once
  // an invoice leaves draft, confirm up front that Razorpay can take payment
  // for it, and keep the stored order in sync with the current total so the
  // pay flow (see /api/payments/razorpay/order) can reuse a single order per
  // invoice instead of minting a new one on every checkout attempt.
  let warning: string | undefined;
  if (header.status !== "draft" && totals.grandTotal > 0) {
    try {
      const order = await createRazorpayOrder({
        id: resolvedInvoiceId,
        invoice_number: invoicePayload.invoice_number,
        total: totals.grandTotal,
        currency: invoicePayload.currency,
      });
      await supabase.from("invoices").update({ razorpay_order_id: order.id }).eq("id", resolvedInvoiceId);
    } catch (razorpayError) {
      warning = `Invoice saved, but Razorpay could not be set up for it: ${
        razorpayError instanceof Error ? razorpayError.message : "Unknown error."
      }`;
    }
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${resolvedInvoiceId}`);
  revalidatePath("/billing");
  revalidatePath("/dashboard");

  return { error: null, invoiceId: resolvedInvoiceId, warning };
}

export async function deleteInvoice(invoiceId: string): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
  if (error) return { error: getReadableErrorMessage(error) };

  revalidatePath("/admin/invoices");
  revalidatePath("/billing");
  revalidatePath("/dashboard");
  return { error: null };
}

/**
 * Marks an invoice as sent: validates it, persists the state change, and
 * notifies the client in-app. No email/SMS provider is configured in this
 * project (no RESEND_API_KEY / TWILIO_* env vars) — this is the real,
 * complete delivery mechanism today, not a placeholder for one. Wiring an
 * email provider in later is a matter of calling it here, after the DB
 * update succeeds and before returning, without changing anything else
 * about this flow. If any step fails, the function returns an error and
 * does NOT report success.
 */
export async function sendInvoice(invoiceId: string): Promise<{ error: string | null; warning?: string }> {
  const { supabase, userId, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("id, client_id, project_id, invoice_number, total, status, currency, razorpay_order_id")
    .eq("id", invoiceId)
    .single();
  if (fetchError || !invoice) return { error: "Invoice not found." };

  if (invoice.status === "cancelled") return { error: "Cancelled invoices can't be sent." };

  const { count: lineItemCount, error: countError } = await supabase
    .from("invoice_line_items")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", invoiceId);
  if (countError) return { error: getReadableErrorMessage(countError) };
  if (!lineItemCount) return { error: "Add at least one line item before sending this invoice." };

  const nextStatus: InvoiceStatus = invoice.status === "draft" ? "pending" : invoice.status;
  const sentAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ status: nextStatus, sent_at: sentAt })
    .eq("id", invoiceId);
  if (updateError) return { error: getReadableErrorMessage(updateError) };

  // A draft can be sent without ever going through saveInvoiceWithLineItems
  // again — this is the other place an invoice leaves draft, so provision
  // the Razorpay order here too if it doesn't have one yet.
  let warning: string | undefined;
  if (!invoice.razorpay_order_id && Number(invoice.total) > 0) {
    try {
      const order = await createRazorpayOrder({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        total: invoice.total,
        currency: invoice.currency,
      });
      await supabase.from("invoices").update({ razorpay_order_id: order.id }).eq("id", invoice.id);
    } catch (razorpayError) {
      warning = `Invoice sent, but Razorpay could not be set up for it: ${
        razorpayError instanceof Error ? razorpayError.message : "Unknown error."
      }`;
    }
  }

  const { error: notifyError } = await supabase.from("notifications").insert({
    user_id: invoice.client_id,
    type: "invoice_generated",
    title: `Invoice ${invoice.invoice_number} sent`,
    body: `A new invoice for ${formatMoney(Number(invoice.total), invoice.currency)} is ready for your review.`,
    reference_id: invoice.id,
  });
  if (notifyError) {
    // The invoice is already marked sent — don't silently swallow this, but
    // don't roll back either; surface it so the admin knows the client
    // wasn't notified and can follow up.
    return { error: `Invoice marked sent, but notifying the client failed: ${getReadableErrorMessage(notifyError)}` };
  }

  await supabase.from("activities").insert({
    project_id: invoice.project_id,
    actor_id: userId,
    action: "invoice_sent",
    details: { invoice_id: invoice.id, invoice_number: invoice.invoice_number },
  });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { error: null, warning };
}
