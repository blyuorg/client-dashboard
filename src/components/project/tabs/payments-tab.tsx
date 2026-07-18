import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/dashboard/compute";
import type { Invoice, InvoiceStatus } from "@/types/database";

const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary",
  pending: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "secondary",
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export function PaymentsTab({ summary, invoices }: { summary: ProjectSummary; invoices: Invoice[] }) {
  const remaining = Math.max(summary.budget - summary.totalInvoiced, 0);
  const pendingAmount = Math.max(summary.totalInvoiced - summary.amountPaid, 0);

  const upcoming = invoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .sort((a, b) => new Date(a.due_date ?? a.invoice_date).getTime() - new Date(b.due_date ?? b.invoice_date).getTime())[0];

  const history = [...invoices].sort(
    (a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Contract value" value={formatCurrency(summary.budget)} />
        <StatTile label="Paid" value={formatCurrency(summary.amountPaid)} />
        <StatTile label="Pending" value={formatCurrency(pendingAmount)} />
        <StatTile label="Remaining" value={formatCurrency(remaining)} />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Upcoming invoice</p>
        {upcoming ? (
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">{upcoming.invoice_number}</p>
              <p className="text-xs text-muted-foreground">Due {formatDate(upcoming.due_date)}</p>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(upcoming.total)}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming invoices.</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Invoice history</p>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices issued yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{invoice.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCurrency(invoice.total)}</span>
                  <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>{invoice.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
