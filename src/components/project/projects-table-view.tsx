import { FolderKanban } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge, ProjectPriorityBadge } from "@/components/dashboard/status-badge";
import { HealthBadge, PhaseBadge } from "./badges";
import { computeProjectHealth } from "@/lib/project/compute";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/dashboard/compute";

export function ProjectsTableView({
  summaries,
  clientName,
  onSelect,
}: {
  summaries: ProjectSummary[];
  clientName: string;
  onSelect: (summary: ProjectSummary) => void;
}) {
  return (
    <div className="rounded-2xl border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[220px]">Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="min-w-[140px]">Progress</TableHead>
            <TableHead>Current Phase</TableHead>
            <TableHead>Assigned Manager</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((summary) => (
            <TableRow
              key={summary.project.id}
              onClick={() => onSelect(summary)}
              className="cursor-pointer transition-colors"
            >
              <TableCell>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <FolderKanban className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{summary.project.title}</p>
                    {summary.project.description && (
                      <p className="truncate text-xs text-muted-foreground">{summary.project.description}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{clientName}</TableCell>
              <TableCell>
                <HealthBadge health={computeProjectHealth(summary.project)} />
              </TableCell>
              <TableCell>
                <ProjectPriorityBadge priority={summary.project.priority} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={summary.project.progress_percent} className="h-1.5 w-24" />
                  <span className="w-9 shrink-0 text-xs text-muted-foreground">
                    {summary.project.progress_percent}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <PhaseBadge phase={summary.currentPhase} />
              </TableCell>
              <TableCell>{summary.assignedEmployee}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(summary.project.deadline)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeTime(summary.project.updated_at)}
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={summary.project.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
