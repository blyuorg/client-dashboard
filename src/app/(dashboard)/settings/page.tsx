import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { createClient, getUser } from "@/lib/supabase/server";
import { listConnections } from "@/lib/integrations/connections";

export default async function SettingsPage() {
  const user = await getUser();
  const supabase = await createClient();
  const [{ data: profile }, connections] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    listConnections(user!.id),
  ]);

  if (!profile) return null;

  return <SettingsPageClient profile={profile} connections={connections} />;
}
