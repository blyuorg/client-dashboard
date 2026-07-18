import {
  CheckCircle2,
  FileUp,
  FolderPlus,
  IndianRupee,
  Milestone as MilestoneIcon,
  Activity as ActivityIcon,
  type LucideIcon,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Activity } from "@/types/database";

const ACTION_META: Record<string, { label: string; icon: LucideIcon }> = {
  project_created: { label: "Project created", icon: FolderPlus },
  file_uploaded: { label: "File uploaded", icon: FileUp },
  client_approved: { label: "Approved by client", icon: CheckCircle2 },
  invoice_paid: { label: "Invoice paid", icon: IndianRupee },
  milestone_completed: { label: "Milestone completed", icon: MilestoneIcon },
};

function metaFor(action: string) {
  return (
    ACTION_META[action] ?? {
      label: action.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()),
      icon: ActivityIcon,
    }
  );
}

export function ActivityTab({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded for this project yet.</p>;
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <ul className="space-y-5">
      {sorted.map((activity, i) => {
        const { label, icon: Icon } = metaFor(activity.action);
        return (
          <li key={activity.id} className="relative flex gap-3 pl-1">
            {i !== sorted.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border" />
            )}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <div className="pt-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.created_at)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
