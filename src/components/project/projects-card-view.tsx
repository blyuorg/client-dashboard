import { FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge, ProjectPriorityBadge } from "@/components/dashboard/status-badge";
import { HealthBadge, PhaseBadge } from "./badges";
import { computeProjectHealth } from "@/lib/project/compute";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/dashboard/compute";

export function ProjectsCardView({
  summaries,
  clientName,
  onSelect,
}: {
  summaries: ProjectSummary[];
  clientName: string;
  onSelect: (summary: ProjectSummary) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaries.map((summary) => (
        <Card
          key={summary.project.id}
          onClick={() => onSelect(summary)}
          className="cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
        >
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <FolderKanban className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{summary.project.title}</p>
                  <p className="text-xs text-muted-foreground">{clientName}</p>
                </div>
              </div>
              <ProjectStatusBadge status={summary.project.status} />
            </div>

            {summary.project.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{summary.project.description}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              <HealthBadge health={computeProjectHealth(summary.project)} />
              <ProjectPriorityBadge priority={summary.project.priority} />
              <PhaseBadge phase={summary.currentPhase} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium text-foreground">{summary.project.progress_percent}%</span>
              </div>
              <Progress value={summary.project.progress_percent} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {summary.completedTasks}/{summary.totalTasks} tasks
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">{summary.assignedEmployee}</span>
              <span className="text-muted-foreground">{formatDate(summary.project.deadline)}</span>
            </div>
            {summary.budget > 0 && (
              <p className="text-xs text-muted-foreground">Budget {formatCurrency(summary.budget)}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
