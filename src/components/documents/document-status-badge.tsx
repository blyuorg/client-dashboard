import { CheckCircle2, Clock, FileEdit, Archive, type LucideIcon } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/documents/types";

const STATUS_META: Record<DocumentStatus, { label: string; variant: BadgeProps["variant"]; icon: LucideIcon }> = {
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  pending_review: { label: "Pending Review", variant: "warning", icon: Clock },
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  archived: { label: "Archived", variant: "outline", icon: Archive },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}
