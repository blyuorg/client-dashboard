import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClientsTable } from "@/components/admin/clients-table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const [{ data: clients }, { data: admins }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "client").order("company_name", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("role", "admin").order("full_name", { ascending: true }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>Edit client details — company info, contact, notes, and who they&rsquo;re assigned to.</CardDescription>
      </CardHeader>
      <CardContent>
        <ClientsTable clients={clients ?? []} admins={admins ?? []} />
      </CardContent>
    </Card>
  );
}
