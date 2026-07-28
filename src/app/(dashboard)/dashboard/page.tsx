import { createClient, getUser } from "@/lib/supabase/server";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectAnalytics } from "@/components/dashboard/project-analytics";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  buildProjectSummaries,
  computeBillingChartData,
  computeKpis,
  computeProjectTimeline,
  computeTaskOverview,
} from "@/lib/dashboard/compute";

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = await createClient();

  // profile and projects have no data dependency on each other — resolving
  // them together instead of one-after-another cuts a full round trip off
  // this request.
  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("full_name, owner_name, company_name").eq("id", user!.id).single(),
    supabase.from("projects").select("*").eq("client_id", user!.id).order("created_at", { ascending: false }),
  ]);

  const projectIds = (projects ?? []).map((p) => p.id);

  const [{ data: tasks }, { data: milestones }, { data: invoices }, { data: payments }, { data: activities }] =
    await Promise.all([
      projectIds.length
        ? supabase.from("tasks").select("*").in("project_id", projectIds)
        : Promise.resolve({ data: [] }),
      projectIds.length
        ? supabase.from("milestones").select("*").in("project_id", projectIds)
        : Promise.resolve({ data: [] }),
      supabase.from("invoices").select("*").eq("client_id", user!.id),
      supabase.from("payments").select("*").eq("client_id", user!.id),
      projectIds.length
        ? supabase
            .from("activities")
            .select("*")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false })
            .limit(15)
        : Promise.resolve({ data: [] }),
    ]);

  const summaries = buildProjectSummaries(
    projects ?? [],
    tasks ?? [],
    invoices ?? [],
    payments ?? [],
    milestones ?? []
  );
  const kpis = computeKpis(projects ?? [], milestones ?? [], summaries);
  const taskOverview = computeTaskOverview(tasks ?? []);
  const timeline = computeProjectTimeline(projects ?? [], milestones ?? []);
  const billing = computeBillingChartData(summaries);
  const clientName = profile?.company_name || profile?.full_name || profile?.owner_name || "You";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Overview Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""} — here&apos;s where things stand.
        </p>
      </div>

      <KpiCards kpis={kpis} />

      <ProjectAnalytics summaries={summaries} taskOverview={taskOverview} timeline={timeline} billing={billing} />

      <ProjectsTable summaries={summaries} clientName={clientName} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TaskOverview data={taskOverview} />
        <RecentActivity activities={activities ?? []} />
      </div>

      <QuickActions />
    </div>
  );
}
