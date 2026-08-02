import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ProjectPriorityBadge, ProjectStatusBadge } from "./status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardProjectFields, ProjectSummary } from "@/lib/dashboard/compute";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export function ProjectDetailDialog({
  summary,
  clientName,
  open,
  onOpenChange,
}: {
  summary: ProjectSummary<DashboardProjectFields> | null;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {summary && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{summary.project.title}</DialogTitle>
                <ProjectStatusBadge status={summary.project.status} />
                <ProjectPriorityBadge priority={summary.project.priority} />
              </div>
              <DialogDescription>
                {summary.project.description || "No description added yet."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{summary.project.progress_percent}%</span>
              </div>
              <Progress value={summary.project.progress_percent} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Client" value={clientName} />
              <Field label="Assigned employee" value={summary.assignedEmployee} />
              <Field label="Employees assigned" value={summary.employeeCount} />
              <Field label="Start date" value={formatDate(summary.project.start_date)} />
              <Field label="Deadline" value={formatDate(summary.project.deadline)} />
              <Field label="Current phase" value={summary.currentPhase} />
              <Field label="Project budget" value={formatCurrency(summary.budget)} />
              <Field label="Amount paid" value={formatCurrency(summary.amountPaid)} />
              <Field label="Outstanding balance" value={formatCurrency(summary.outstandingBalance)} />
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Team members</p>
              {summary.project.assigned_team && summary.project.assigned_team.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {summary.project.assigned_team.map((name) => (
                    <span key={name} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No team members assigned yet.</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
