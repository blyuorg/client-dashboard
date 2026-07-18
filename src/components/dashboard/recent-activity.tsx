import {
  CheckCircle2,
  FileUp,
  FolderPlus,
  IndianRupee,
  Milestone as MilestoneIcon,
  Activity as ActivityIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your projects</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet — updates will appear here.</p>
        ) : (
          <ul className="space-y-5">
            {activities.map((activity, i) => {
              const { label, icon: Icon } = metaFor(activity.action);
              return (
                <li key={activity.id} className="relative flex gap-3 pl-1">
                  {i !== activities.length - 1 && (
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
        )}
      </CardContent>
    </Card>
  );
}
