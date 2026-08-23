import { getUser } from "@/lib/supabase/server";
import { listUpcomingMeetings } from "@/lib/meetings/queries";
import { listConnections } from "@/lib/integrations/connections";
import { MeetingsPageClient } from "@/components/meetings/meetings-page-client";

export default async function MeetingsPage() {
  const user = await getUser();
  if (!user) return null;

  const [meetings, connections] = await Promise.all([listUpcomingMeetings(user.id), listConnections(user.id)]);

  return <MeetingsPageClient initialMeetings={meetings} connectedProviders={connections.map((c) => c.provider)} />;
}
