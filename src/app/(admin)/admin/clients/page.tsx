import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClientsTable } from "@/components/admin/clients-table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("company_name", { ascending: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>Edit client details — company info, contact, and notes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ClientsTable clients={clients ?? []} />
      </CardContent>
    </Card>
  );
}
