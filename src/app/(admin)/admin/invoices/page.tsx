import { createClient } from "@/lib/supabase/server";
import { InvoicesTable } from "@/components/admin/invoices-table";
export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const [{ data: invoices }, { data: projects }, { data: clients }] = await Promise.all([supabase.from("invoices").select("*").order("created_at", { ascending: false }), supabase.from("projects").select("*").order("title"), supabase.from("profiles").select("id, company_name, owner_name, full_name, email")]);
  const projectNames = new Map((projects ?? []).map(p => [p.id, p.title])); const clientNames = new Map((clients ?? []).map(c => [c.id, c.company_name || c.owner_name || c.full_name || c.email]));
  return <div><h1 className="mb-1 font-display text-3xl">Invoices</h1><p className="mb-6 text-sm text-muted-foreground">Create and manage the billing records your clients can pay.</p><InvoicesTable projects={projects ?? []} invoices={(invoices ?? []).map(i => ({ ...i, projectTitle: projectNames.get(i.project_id) ?? "—", clientLabel: clientNames.get(i.client_id) ?? "—" }))} /></div>;
}
