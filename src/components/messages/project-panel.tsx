import { FileStack, Activity as ActivityIcon, NotebookText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TeamMemberCard } from "@/components/messages/team-member-card";
import { MessagesEmptyState } from "@/components/messages/empty-state";
import type { TeamRole } from "@/lib/messages/types";

const TEAM_ROLES: TeamRole[] = [
  "Project Manager",
  "UI Designer",
  "Frontend Developer",
  "Backend Developer",
  "QA Engineer",
];

const STATUS_ROWS = [
  { label: "Current Phase", value: "Not set" },
  { label: "Priority", value: "Not set" },
  { label: "Deadline", value: "Not set" },
];

export function ProjectPanel() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Assigned Team</h2>
        <div className="space-y-2">
          {TEAM_ROLES.map((role) => (
            <TeamMemberCard key={role} role={role} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Project Status</CardTitle>
          <CardDescription>Overview of where this project stands</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">—</span>
            </div>
            <Progress value={0} className="h-1.5" />
          </div>
          {STATUS_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-muted-foreground/70">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="secondary">Not set</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Shared Files</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagesEmptyState
            icon={FileStack}
            title="No Shared Files"
            description="Files shared in this conversation will appear here."
            size="sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagesEmptyState
            icon={ActivityIcon}
            title="No Activity"
            description="Project updates and milestones will show up here."
            size="sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Meeting Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagesEmptyState
            icon={NotebookText}
            title="No Meeting Notes"
            description="Notes from meetings with your team will appear here."
            size="sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
