import { ProfileCard } from "@/components/profile/profile-card";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">My Profile</h1>
        <p className="text-sm text-muted-foreground">View your account information and contact details.</p>
      </div>

      <ProfileCard profile={profile} />
    </div>
  );
}
