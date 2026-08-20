import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient, getUser } from "@/lib/supabase/server";
import { InvoicePdfDocument, type InvoicePdfData } from "@/lib/invoices/invoice-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(
      "id, client_id, project_id, invoice_number, invoice_date, due_date, status, currency, notes, terms, gst_percent, gst_type, subtotal, discount, cgst_amount, sgst_amount, igst_amount, total"
    )
    .eq("id", id)
    .single();

  if (invoiceError || !invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (!isAdmin && invoice.client_id !== user.id) {
    return NextResponse.json({ error: "You don't have permission to view this invoice." }, { status: 403 });
  }

  const [{ data: project }, { data: client }, { data: lineItems }] = await Promise.all([
    supabase.from("projects").select("title").eq("id", invoice.project_id).single(),
    supabase
      .from("profiles")
      .select("full_name, company_name, email, address, gst_number")
      .eq("id", invoice.client_id)
      .single(),
    supabase
      .from("invoice_line_items")
      .select("description, quantity, unit_price, discount_percent, taxable_amount")
      .eq("invoice_id", id)
      .order("order_index", { ascending: true }),
  ]);

  const pdfData: InvoicePdfData = {
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    status: invoice.status,
    currency: invoice.currency,
    notes: invoice.notes,
    terms: invoice.terms,
    gst_percent: Number(invoice.gst_percent),
    gst_type: invoice.gst_type,
    subtotal: Number(invoice.subtotal),
    discount: Number(invoice.discount),
    cgst_amount: Number(invoice.cgst_amount),
    sgst_amount: Number(invoice.sgst_amount),
    igst_amount: Number(invoice.igst_amount),
    total: Number(invoice.total),
    projectTitle: project?.title ?? "Project",
    client: {
      name: client?.full_name || "Client",
      companyName: client?.company_name ?? null,
      email: client?.email ?? "",
      address: client?.address ?? null,
      gstNumber: client?.gst_number ?? null,
    },
    lineItems: (lineItems ?? []).map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      discount_percent: Number(item.discount_percent),
      taxable_amount: Number(item.taxable_amount),
    })),
  };

  const buffer = await renderToBuffer(InvoicePdfDocument({ invoice: pdfData }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
