import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder, fetchRazorpayOrder, getRazorpayConfig } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { invoiceId } = await request.json();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, total, currency, status, razorpay_order_id")
    .eq("id", invoiceId)
    .eq("client_id", user.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (invoice.status === "paid" || invoice.status === "cancelled") {
    return NextResponse.json({ error: "This invoice cannot be paid." }, { status: 400 });
  }

  try {
    const { keyId } = getRazorpayConfig();
    const expectedAmount = Math.round(Number(invoice.total) * 100);

    // Invoice creation/edit already provisions a Razorpay order for the
    // current total (see saveInvoiceWithLineItems) — reuse it so repeat
    // checkout attempts for the same invoice don't pile up separate orders
    // in the Razorpay dashboard. Only mint a new one if none exists yet, or
    // if it no longer matches the invoice (e.g. edited before this feature
    // existed, or the stored order was since paid/expired).
    let order = invoice.razorpay_order_id ? await fetchRazorpayOrder(invoice.razorpay_order_id).catch(() => null) : null;
    if (!order || order.amount !== expectedAmount || order.notes?.invoice_id !== invoice.id) {
      order = await createRazorpayOrder({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        total: invoice.total,
        currency: invoice.currency,
      });
      await supabase.from("invoices").update({ razorpay_order_id: order.id }).eq("id", invoice.id);
    }

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start checkout." }, { status: 500 });
  }
}
