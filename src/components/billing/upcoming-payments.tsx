import { AlertTriangle, Clock, CalendarCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/billing/empty-state";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { UpcomingPayment } from "@/lib/dashboard/billing-types";

export function UpcomingPayments({ payments = [] }: { payments?: UpcomingPayment[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Invoices due in the coming weeks</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={payments.length === 0 ? undefined : "space-y-3"}>
        {payments.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No upcoming payments"
            description="You're all caught up — future due invoices will show up here."
          />
        ) : (
          payments.map((payment) => {
            const overdue = payment.status === "overdue";
            return (
              <div
                key={payment.id}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  overdue ? "border-destructive/40 bg-destructive/5" : "border-border bg-secondary/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payment.name}</p>
                    <p className="text-xs text-muted-foreground">Due {formatDate(payment.dueDate)}</p>
                  </div>
                  <Badge variant={overdue ? "destructive" : "warning"} className="shrink-0">
                    {overdue ? "Overdue" : "Due soon"}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      overdue ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {overdue
                      ? `${Math.abs(payment.daysRemaining)} days overdue`
                      : `${payment.daysRemaining} days remaining`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
