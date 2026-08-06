import { createClient, getUser } from "@/lib/supabase/server";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectAnalytics } from "@/components/dashboard/project-analytics";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  // this request. Each select() below is scoped to exactly the columns the
  // dashboard renders or computes with (see DashboardProjectFields and the
  // Minimal* picks in lib/dashboard/compute.ts) instead of `*`.
  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("full_name, owner_name, company_name, role").eq("id", user!.id).single(),
    supabase
      .from("projects")
      .select("id, title, status, priority, progress_percent, start_date, deadline, assigned_team, budget, description")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const projectIds = (projects ?? []).map((p) => p.id);

  const [{ data: tasks }, { data: milestones }, { data: invoices }, { data: payments }, { data: activities }] =
    await Promise.all([
      projectIds.length
        ? supabase.from("tasks").select("project_id, status").in("project_id", projectIds)
        : Promise.resolve({ data: [] }),
      projectIds.length
        ? supabase
            .from("milestones")
            .select("project_id, status, order_index, title, completed_at")
            .in("project_id", projectIds)
        : Promise.resolve({ data: [] }),
      supabase.from("invoices").select("id, project_id, status, total").eq("client_id", user!.id),
      supabase.from("payments").select("invoice_id, status, amount").eq("client_id", user!.id),
      projectIds.length
        ? supabase
            .from("activities")
            .select("id, action, created_at")
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

      {profile?.role === "admin" && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/admin/projects">
              <Pencil className="mr-2 h-4 w-4" />
              Edit projects
            </Link>
          </Button>
        </div>
      )}

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
