import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getMeetingProvider } from "@/lib/integrations/provider";
import { getValidAccessToken } from "@/lib/integrations/tokens";
import { deleteCalendarEvent } from "@/lib/integrations/google/calendar";

export type CancelMeetingResult = { error: string | null };

/**
 * Cancels both sides best-effort: the provider meeting and the Google
 * Calendar event. Either can independently fail (token revoked, resource
 * already gone) without blocking the other — the database status flips to
 * 'cancelled' regardless, since from the user's perspective "cancel" must
 * always succeed in this app even if cleanup on a third-party service
 * couldn't complete.
 */
export async function cancelMeeting(userId: string, meetingId: string): Promise<CancelMeetingResult> {
  const supabase = await createClient();

  const { data: meeting } = await supabase
    .from("scheduled_meetings")
    .select("*")
    .eq("id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!meeting) return { error: "Meeting not found." };
  if (meeting.status === "cancelled") return { error: null };

  let syncError: string | null = null;

  if (meeting.provider !== "google_meet" && meeting.provider_meeting_id) {
    try {
      const provider = getMeetingProvider(meeting.provider);
      await provider.deleteMeeting(userId, meeting.provider_meeting_id);
    } catch (error) {
      console.error("[cancelMeeting] provider delete failed", meeting.provider, error instanceof Error ? error.message : error);
      syncError = `Couldn't cancel the ${meeting.provider} meeting — it may need to be removed manually.`;
    }
  }

  if (meeting.google_calendar_event_id) {
    try {
      const accessToken = await getValidAccessToken(userId, "google");
      await deleteCalendarEvent(accessToken, meeting.google_calendar_event_id);
    } catch (error) {
      console.error("[cancelMeeting] calendar delete failed", error instanceof Error ? error.message : error);
      syncError = syncError
        ? `${syncError} The calendar event may also still exist.`
        : "The calendar event couldn't be removed automatically.";
    }
  }

  const { error: updateError } = await supabase
    .from("scheduled_meetings")
    .update({ status: "cancelled", sync_error: syncError })
    .eq("id", meetingId);

  if (updateError) return { error: "Failed to cancel the meeting. Please try again." };

  return { error: null };
}
