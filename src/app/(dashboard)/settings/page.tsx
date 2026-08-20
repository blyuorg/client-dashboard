import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  if (!profile) return null;

  return <SettingsPageClient profile={profile} />;
}
