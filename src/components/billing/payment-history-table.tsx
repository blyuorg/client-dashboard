import { CheckCircle2, Clock, XCircle, RotateCcw, Receipt, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/billing/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentMethod, PaymentStatus } from "@/types/database";

const STATUS_META: Record<PaymentStatus, { label: string; variant: BadgeProps["variant"]; icon: LucideIcon }> = {
  success: { label: "Success", variant: "success", icon: CheckCircle2 },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
  refunded: { label: "Refunded", variant: "secondary", icon: RotateCcw },
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  card: "Card",
  upi: "UPI",
  cash: "Cash",
  other: "Razorpay",
};

export type PaymentHistoryRow = {
  id: string;
  invoiceNumber: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  transactionId: string | null;
};

export function PaymentHistoryTable({ payments = [] }: { payments?: PaymentHistoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Every payment recorded against your account</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Receipt}
                    title="No payments yet"
                    description="Payments you make will show up here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const meta = STATUS_META[payment.status];
                const Icon = meta.icon;
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="pl-6 font-medium">{payment.invoiceNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{METHOD_LABELS[payment.method]}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={meta.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
