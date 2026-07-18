import { Badge } from "@/components/ui/badge";
import type { ProjectPriority, ProjectStatus } from "@/types/database";

const STATUS_META: Record<ProjectStatus, { label: string; variant: "default" | "success" | "warning" | "secondary" | "destructive" }> = {
  not_started: { label: "Not started", variant: "secondary" },
  in_progress: { label: "In progress", variant: "default" },
  on_hold: { label: "On hold", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const PRIORITY_META: Record<ProjectPriority, { label: string; variant: "default" | "success" | "warning" | "secondary" | "destructive" }> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "default" },
  high: { label: "High", variant: "warning" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function ProjectPriorityBadge({ priority }: { priority: ProjectPriority }) {
  const meta = PRIORITY_META[priority];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
