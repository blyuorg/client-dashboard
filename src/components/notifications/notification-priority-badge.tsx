import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { NotificationPriority } from "@/lib/notifications/types";

const PRIORITY_META: Record<NotificationPriority, { label: string; variant: BadgeProps["variant"] }> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "default" },
  high: { label: "High", variant: "warning" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export function NotificationPriorityBadge({ priority }: { priority: NotificationPriority }) {
  const meta = PRIORITY_META[priority];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
