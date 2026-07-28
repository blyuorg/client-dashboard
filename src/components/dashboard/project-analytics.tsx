"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillingChartRow, ProjectSummary, TaskOverview, TimelinePoint } from "@/lib/dashboard/compute";

// recharts (+ its internal d3 deps) is a large client-only bundle; these
// charts are always below the fold on first paint, so loading them in a
// separate chunk after hydration keeps the dashboard's initial JS small
// without changing what's rendered.
const chartLoading = <Skeleton className="h-64 w-full" />;

const ProjectProgressChart = dynamic(
  () => import("./project-progress-chart").then((m) => m.ProjectProgressChart),
  { ssr: false, loading: () => chartLoading }
);
const TaskCompletionDonut = dynamic(
  () => import("./task-completion-donut").then((m) => m.TaskCompletionDonut),
  { ssr: false, loading: () => chartLoading }
);
const ProjectTimelineChart = dynamic(
  () => import("./project-timeline-chart").then((m) => m.ProjectTimelineChart),
  { ssr: false, loading: () => chartLoading }
);
const BillingProgressChart = dynamic(
  () => import("./billing-progress-chart").then((m) => m.BillingProgressChart),
  { ssr: false, loading: () => chartLoading }
);

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
