import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TaskOverview as TaskOverviewData } from "@/lib/dashboard/compute";

const ROWS: { key: keyof TaskOverviewData; label: string; className: string }[] = [
  { key: "completed", label: "Completed", className: "bg-success" },
  { key: "in_progress", label: "In progress", className: "bg-primary" },
  { key: "pending", label: "Pending", className: "bg-secondary-foreground/40" },
  { key: "blocked", label: "Blocked", className: "bg-destructive" },
];

export function TaskOverview({ data }: { data: TaskOverviewData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
        <CardDescription>{data.total} total tasks across all projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.total === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet — they&apos;ll show up here once created.</p>
        ) : (
          ROWS.map((row) => {
            const count = data[row.key] as number;
            const percent = Math.round((count / data.total) * 100);
            return (
              <div key={row.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">
                    {count} <span className="text-xs text-muted-foreground">({percent}%)</span>
                  </span>
                </div>
                <Progress value={percent} indicatorClassName={row.className} />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
