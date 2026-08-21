import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AppearanceInit } from "@/components/layout/appearance-init";
import { PresenceProvider } from "@/lib/presence/presence-provider";
import { getUnreadMessageCount } from "@/lib/messages/queries";
import type { AppearancePreferences, PrivacyPreferences } from "@/lib/settings/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [{ data: profile }, unreadCount] = await Promise.all([
    supabase.from("profiles").select("full_name, owner_name, role, preferences").eq("id", user.id).single(),
    getUnreadMessageCount(user.id),
  ]);

  const appearance = profile?.preferences?.appearance as AppearancePreferences | undefined;
  const privacy = profile?.preferences?.privacy as PrivacyPreferences | undefined;

  return (
    <PresenceProvider userId={user.id} initialEnabled={privacy?.showOnlineStatus ?? true}>
      <AppearanceInit accent={appearance?.accent ?? "blue"} fontSize={appearance?.fontSize ?? "medium"} />
      <div className="flex min-h-screen">
        <Sidebar isAdmin={profile?.role === "admin"} userId={user.id} initialUnreadCount={unreadCount} />
        <div className="flex flex-1 flex-col">
          <Topbar userName={profile?.full_name ?? profile?.owner_name} />
          <main className="flex-1 bg-muted/20 p-6">{children}</main>
        </div>
      </div>
    </PresenceProvider>
  );
}
