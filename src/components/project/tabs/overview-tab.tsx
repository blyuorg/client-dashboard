import { Progress } from "@/components/ui/progress";
import { ProjectPriorityBadge, ProjectStatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/dashboard/compute";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export function OverviewTab({ summary, clientName }: { summary: ProjectSummary; clientName: string }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
        <p className="mt-1 text-sm text-foreground">
          {summary.project.description || "No description added yet."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-medium">{summary.project.progress_percent}%</span>
        </div>
        <Progress value={summary.project.progress_percent} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Client" value={clientName} />
        <Field label="Project manager" value={summary.assignedEmployee} />
        <Field label="Start date" value={formatDate(summary.project.start_date)} />
        <Field label="Deadline" value={formatDate(summary.project.deadline)} />
        <Field label="Status" value={<ProjectStatusBadge status={summary.project.status} />} />
        <Field label="Priority" value={<ProjectPriorityBadge priority={summary.project.priority} />} />
        <Field label="Budget" value={formatCurrency(summary.budget)} />
      </div>
    </div>
  );
}
