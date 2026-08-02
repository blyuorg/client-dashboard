import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProjectsTable } from "@/components/admin/projects-table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("role", "client").order("company_name", { ascending: true }),
  ]);

  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));
  const projectsWithClient = (projects ?? []).map((project) => {
    const client = clientById.get(project.client_id);
    return { ...project, clientLabel: client?.company_name || client?.owner_name || client?.email || "Unknown" };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Add and update projects across all clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectsTable projects={projectsWithClient} clients={clients ?? []} />
      </CardContent>
    </Card>
  );
}
