import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Milestone } from "@/types/database";

export function MilestonesTab({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) {
    return <p className="text-sm text-muted-foreground">No milestones set up for this project yet.</p>;
  }

  const sorted = [...milestones].sort((a, b) => a.order_index - b.order_index);

  return (
    <ul className="space-y-1">
      {sorted.map((milestone, i) => {
        const isLast = i === sorted.length - 1;
        const Icon =
          milestone.status === "completed" ? CheckCircle2 : milestone.status === "in_progress" ? RefreshCw : Circle;
        const iconClass =
          milestone.status === "completed"
            ? "text-success"
            : milestone.status === "in_progress"
              ? "text-primary"
              : "text-muted-foreground";

        return (
          <li key={milestone.id} className="relative flex gap-3 pb-6 pl-1 last:pb-0">
            {!isLast && <span className="absolute left-[11px] top-6 h-[calc(100%-4px)] w-px bg-border" />}
            <Icon className={`mt-0.5 h-[22px] w-[22px] shrink-0 ${iconClass}`} />
            <div>
              <p
                className={`text-sm font-medium ${milestone.status === "completed" ? "text-muted-foreground line-through" : ""}`}
              >
                {milestone.title}
              </p>
              {milestone.description && (
                <p className="text-xs text-muted-foreground">{milestone.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {milestone.status === "completed"
                  ? `Completed ${formatDate(milestone.completed_at)}`
                  : milestone.due_date
                    ? `Due ${formatDate(milestone.due_date)}`
                    : "No due date"}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
