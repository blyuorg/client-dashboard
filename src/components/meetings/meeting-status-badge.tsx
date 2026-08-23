import { Badge } from "@/components/ui/badge";
import type { DisplayMeetingStatus } from "@/lib/meetings/status";

const STATUS_META: Record<DisplayMeetingStatus, { label: string; variant: "default" | "success" | "warning" | "outline" | "destructive" }> = {
  upcoming: { label: "Upcoming", variant: "outline" },
  starting_soon: { label: "Starting soon", variant: "warning" },
  in_progress: { label: "In progress", variant: "success" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export function MeetingStatusBadge({ status }: { status: DisplayMeetingStatus }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
