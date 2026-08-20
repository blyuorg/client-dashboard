import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function DocumentsPage() {
  const user = await getUser();
  const supabase = await createClient();
  const [{ data: profile }, { data: documents }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
    supabase.from("documents").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title").order("title"),
  ]);

  const projectTitles = new Map((projects ?? []).map((project) => [project.id, project.title]));
  const documentRecords = (documents ?? []).map((document) => ({
    id: document.id,
    fileName: document.file_name,
    fileType: document.mime_type ?? "File",
    fileSize: document.file_size ?? 0,
    projectId: document.project_id,
    project: document.project_id ? projectTitles.get(document.project_id) ?? "Project" : "Unassigned",
    uploadedAt: document.created_at,
    storagePath: document.storage_path,
  }));

  return (
    <DocumentsPageClient
      documents={documentRecords}
      projects={projects ?? []}
      isAdmin={profile?.role === "admin"}
    />
  );
}
