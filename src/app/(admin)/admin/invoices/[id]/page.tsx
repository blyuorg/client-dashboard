import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { InvoiceSummary } from "@/components/invoices/invoice-summary";
import { InvoiceDetailActions } from "@/components/admin/invoice-detail-actions";

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: invoice }, { data: lineItems }, { data: projects }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).single(),
    supabase.from("invoice_line_items").select("*").eq("invoice_id", id).order("order_index", { ascending: true }),
    supabase.from("projects").select("*").order("title"),
  ]);

  if (!invoice) notFound();

  const [{ data: project }, { data: client }] = await Promise.all([
    supabase.from("projects").select("title").eq("id", invoice.project_id).single(),
    supabase
      .from("profiles")
      .select("company_name, owner_name, full_name, email")
      .eq("id", invoice.client_id)
      .single(),
  ]);

  const clientLabel = client?.company_name || client?.owner_name || client?.full_name || client?.email || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Link>
        </Button>
        <InvoiceDetailActions invoice={invoice} lineItems={lineItems ?? []} projects={projects ?? []} />
      </div>

      <InvoiceSummary
        invoice={invoice}
        lineItems={lineItems ?? []}
        projectTitle={project?.title ?? "—"}
        clientLabel={clientLabel}
      />
    </div>
  );
}
