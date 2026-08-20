import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { InvoiceSummary } from "@/components/invoices/invoice-summary";
import { PayInvoiceButton } from "@/components/billing/pay-invoice-button";

export default async function ClientInvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();

  // RLS already scopes this to the signed-in client's own invoices, but the
  // explicit check keeps intent clear and gives a real 404 instead of a
  // confusing empty page if the row exists but isn't theirs.
  if (!invoice || invoice.client_id !== user!.id) notFound();

  const [{ data: lineItems }, { data: project }] = await Promise.all([
    supabase.from("invoice_line_items").select("*").eq("invoice_id", invoiceId).order("order_index", { ascending: true }),
    supabase.from("projects").select("title").eq("id", invoice.project_id).single(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/billing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to billing
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
          {(invoice.status === "pending" || invoice.status === "overdue") && (
            <PayInvoiceButton invoiceId={invoice.id} invoiceNumber={invoice.invoice_number} />
          )}
        </div>
      </div>

      <InvoiceSummary
        invoice={invoice}
        lineItems={lineItems ?? []}
        projectTitle={project?.title ?? "—"}
        clientLabel="You"
      />
    </div>
  );
}
