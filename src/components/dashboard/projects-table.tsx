"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge } from "./status-badge";
import { ProjectDetailDialog } from "./project-detail-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardProjectFields, ProjectSummary } from "@/lib/dashboard/compute";

export function ProjectsTable({
  summaries,
  clientName,
}: {
  summaries: ProjectSummary<DashboardProjectFields>[];
  clientName: string;
}) {
  const [selected, setSelected] = useState<ProjectSummary<DashboardProjectFields> | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
        <CardDescription>Click a project for full details</CardDescription>
      </CardHeader>
      <CardContent>
        {summaries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No projects assigned yet</p>
            <p className="text-xs text-muted-foreground">
              Once a project is created for you, it will show up here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Assigned employee</TableHead>
                <TableHead className="text-right">Team size</TableHead>
                <TableHead className="text-right">Tasks</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow
                  key={summary.project.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(summary)}
                >
                  <TableCell className="font-medium">{summary.project.title}</TableCell>
                  <TableCell className="text-muted-foreground">{clientName}</TableCell>
                  <TableCell>{summary.assignedEmployee}</TableCell>
                  <TableCell className="text-right">{summary.employeeCount}</TableCell>
                  <TableCell className="text-right">
                    {summary.completedTasks}/{summary.totalTasks}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.budget)}</TableCell>
                  <TableCell>
                    <div className="flex w-32 items-center gap-2">
                      <Progress value={summary.project.progress_percent} className="h-1.5" />
                      <span className="w-9 shrink-0 text-xs text-muted-foreground">
                        {summary.project.progress_percent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(summary.project.deadline)}</TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={summary.project.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ProjectDetailDialog
        summary={selected}
        clientName={clientName}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </Card>
  );
}
