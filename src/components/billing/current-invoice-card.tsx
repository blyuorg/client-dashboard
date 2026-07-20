import { Eye, Download, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/billing/invoice-status-badge";
import { EmptyState } from "@/components/billing/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CurrentInvoice } from "@/lib/dashboard/billing-types";

export function CurrentInvoiceCard({ invoice }: { invoice?: CurrentInvoice | null }) {
  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      {invoice ? (
        <CardContent className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">Current Invoice</p>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <p className="text-lg font-semibold leading-tight">{invoice.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">{invoice.project}</p>
              <p className="text-xs text-muted-foreground">Due {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(invoice.amount)}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                View Invoice
              </Button>
              <Button size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="relative p-6">
          <EmptyState
            icon={Receipt}
            title="No active invoice"
            description="Your current invoice will show up here as soon as one is raised."
          />
        </CardContent>
      )}
    </Card>
  );
}
