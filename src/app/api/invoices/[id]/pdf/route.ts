import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { renderInvoicePdfBuffer, type InvoicePdfData } from "@/lib/invoices/invoice-pdf";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid invoice id." }, { status: 400 });

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

  let buffer: Buffer;
  try {
    buffer = await renderInvoicePdfBuffer(pdfData);
  } catch (err) {
    console.error("[invoice-pdf] render failed", { invoiceId: id, userId: user.id, error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: "Couldn't generate the invoice PDF. Please try again." }, { status: 500 });
  }

  const url = new URL(_request.url);
  const disposition = url.searchParams.get("download") === "0" ? "inline" : "attachment";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="Invoice-${invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
