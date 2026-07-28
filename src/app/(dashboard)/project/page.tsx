import { createClient, getUser } from "@/lib/supabase/server";
import { ProjectsPageClient } from "@/components/project/projects-page-client";
import { buildProjectSummaries } from "@/lib/dashboard/compute";

export default async function ProjectPage() {
  const user = await getUser();
  const supabase = await createClient();

  // profile and projects have no data dependency on each other — resolving
  // them together instead of one-after-another cuts a full round trip off
  // this request.
  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("full_name, owner_name, company_name, role").eq("id", user!.id).single(),
    supabase.from("projects").select("*").eq("client_id", user!.id).order("updated_at", { ascending: false }),
  ]);

  const projectIds = (projects ?? []).map((p) => p.id);
  const empty = Promise.resolve({ data: [] });

  const [
    { data: tasks },
    { data: milestones },
    { data: invoices },
    { data: payments },
    { data: activities },
    { data: approvals },
    { data: documents },
    { data: messages },
    { data: meetings },
  ] = await Promise.all([
    projectIds.length ? supabase.from("tasks").select("*").in("project_id", projectIds) : empty,
    projectIds.length ? supabase.from("milestones").select("*").in("project_id", projectIds) : empty,
    supabase.from("invoices").select("*").eq("client_id", user!.id),
    supabase.from("payments").select("*").eq("client_id", user!.id),
    projectIds.length
      ? supabase.from("activities").select("*").in("project_id", projectIds)
      : empty,
    projectIds.length
      ? supabase.from("project_approvals").select("*").in("project_id", projectIds)
      : empty,
    projectIds.length ? supabase.from("documents").select("*").in("project_id", projectIds) : empty,
    projectIds.length ? supabase.from("messages").select("*").in("project_id", projectIds) : empty,
    projectIds.length ? supabase.from("meetings").select("*").in("project_id", projectIds) : empty,
  ]);

  const summaries = buildProjectSummaries(
    projects ?? [],
    tasks ?? [],
    invoices ?? [],
    payments ?? [],
    milestones ?? []
  );
  const clientName = profile?.company_name || profile?.full_name || profile?.owner_name || "You";

  return (
    <ProjectsPageClient
      summaries={summaries}
      clientName={clientName}
      isAdmin={profile?.role === "admin"}
      milestones={milestones ?? []}
      activities={activities ?? []}
      approvals={approvals ?? []}
      documents={documents ?? []}
      messages={messages ?? []}
      meetings={meetings ?? []}
      invoices={invoices ?? []}
    />
  );
}
