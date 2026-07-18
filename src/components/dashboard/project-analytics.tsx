import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectProgressChart } from "./project-progress-chart";
import { TaskCompletionDonut } from "./task-completion-donut";
import { ProjectTimelineChart } from "./project-timeline-chart";
import { BillingProgressChart } from "./billing-progress-chart";
import type { BillingChartRow, ProjectSummary, TaskOverview, TimelinePoint } from "@/lib/dashboard/compute";

export function ProjectAnalytics({
  summaries,
  taskOverview,
  timeline,
  billing,
}: {
  summaries: ProjectSummary[];
  taskOverview: TaskOverview;
  timeline: TimelinePoint[];
  billing: BillingChartRow[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Completion percentage across active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectProgressChart summaries={summaries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Completion</CardTitle>
          <CardDescription>Completed vs. remaining tasks, all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskCompletionDonut
            completed={taskOverview.completed}
            remaining={taskOverview.total - taskOverview.completed}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Cumulative progress from completed milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectTimelineChart data={timeline} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Progress</CardTitle>
          <CardDescription>Paid, pending, and remaining contract value</CardDescription>
        </CardHeader>
        <CardContent>
          <BillingProgressChart data={billing} />
        </CardContent>
      </Card>
    </div>
  );
}
