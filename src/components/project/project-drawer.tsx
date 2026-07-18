import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HealthBadge } from "./badges";
import { ProjectPriorityBadge, ProjectStatusBadge } from "@/components/dashboard/status-badge";
import { computeProjectHealth } from "@/lib/project/compute";
import { OverviewTab } from "./tabs/overview-tab";
import { MilestonesTab } from "./tabs/milestones-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { DeliverablesTab } from "./tabs/deliverables-tab";
import { FilesTab } from "./tabs/files-tab";
import { ApprovalsTab } from "./tabs/approvals-tab";
import { PaymentsTab } from "./tabs/payments-tab";
import { TeamTab } from "./tabs/team-tab";
import { CommunicationTab } from "./tabs/communication-tab";
import type { ProjectSummary } from "@/lib/dashboard/compute";
import type { Activity, Document, Invoice, Meeting, Message, Milestone, ProjectApproval } from "@/types/database";

export function ProjectDrawer({
  summary,
  clientName,
  milestones,
  activities,
  approvals,
  documents,
  messages,
  meetings,
  invoices,
  open,
  onOpenChange,
}: {
  summary: ProjectSummary | null;
  clientName: string;
  milestones: Milestone[];
  activities: Activity[];
  approvals: ProjectApproval[];
  documents: Document[];
  messages: Message[];
  meetings: Meeting[];
  invoices: Invoice[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const projectId = summary?.project.id;
  const projectMilestones = milestones.filter((m) => m.project_id === projectId);
  const projectActivities = activities.filter((a) => a.project_id === projectId);
  const projectApprovals = approvals.filter((a) => a.project_id === projectId);
  const projectDocuments = documents.filter((d) => d.project_id === projectId);
  const projectMessages = messages.filter((m) => m.project_id === projectId);
  const projectMeetings = meetings.filter((m) => m.project_id === projectId);
  const projectInvoices = invoices.filter((i) => i.project_id === projectId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-hidden p-0">
        {summary && (
          <>
            <SheetHeader>
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle>{summary.project.title}</SheetTitle>
                <ProjectStatusBadge status={summary.project.status} />
              </div>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                <HealthBadge health={computeProjectHealth(summary.project)} />
                <ProjectPriorityBadge priority={summary.project.priority} />
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="approvals">Approvals</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="communication">Comms</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <OverviewTab summary={summary} clientName={clientName} />
                </TabsContent>
                <TabsContent value="milestones">
                  <MilestonesTab milestones={projectMilestones} />
                </TabsContent>
                <TabsContent value="activity">
                  <ActivityTab activities={projectActivities} />
                </TabsContent>
                <TabsContent value="deliverables">
                  <DeliverablesTab deliverables={summary.project.deliverables} />
                </TabsContent>
                <TabsContent value="files">
                  <FilesTab documents={projectDocuments} />
                </TabsContent>
                <TabsContent value="approvals">
                  <ApprovalsTab approvals={projectApprovals} />
                </TabsContent>
                <TabsContent value="payments">
                  <PaymentsTab summary={summary} invoices={projectInvoices} />
                </TabsContent>
                <TabsContent value="team">
                  <TeamTab team={summary.project.assigned_team ?? []} />
                </TabsContent>
                <TabsContent value="communication">
                  <CommunicationTab messages={projectMessages} meetings={projectMeetings} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
