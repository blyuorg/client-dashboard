import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { BillingSummary } from "@/lib/dashboard/billing-types";

const ROWS: { key: keyof Omit<BillingSummary, "grandTotal">; label: string; isDiscount?: boolean }[] = [
  { key: "subtotal", label: "Subtotal" },
  { key: "discount", label: "Discount", isDiscount: true },
  { key: "tax", label: "Tax" },
  { key: "additionalCharges", label: "Additional Charges" },
];

export function BillingSummaryCard({ summary }: { summary?: BillingSummary | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Summary</CardTitle>
        <CardDescription>Breakdown for the current invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={
                summary
                  ? row.isDiscount
                    ? "font-medium text-success"
                    : "font-medium"
                  : "font-medium text-muted-foreground/60"
              }
            >
              {summary ? (row.isDiscount ? "-" : "") + formatCurrency(Math.abs(summary[row.key])) : "—"}
            </span>
          </div>
        ))}
        <div className="my-1 h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Grand Total</span>
          <span className="text-xl font-bold tracking-tight">
            {summary ? formatCurrency(summary.grandTotal) : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
