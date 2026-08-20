import { CheckCircle2, Clock, AlertTriangle, FileEdit, Ban, type LucideIcon } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/types/database";

const STATUS_META: Record<InvoiceStatus, { label: string; variant: BadgeProps["variant"]; icon: LucideIcon }> = {
  paid: { label: "Paid", variant: "success", icon: CheckCircle2 },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertTriangle },
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  cancelled: { label: "Cancelled", variant: "secondary", icon: Ban },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}
