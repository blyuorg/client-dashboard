import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getMeetingProvider } from "@/lib/integrations/provider";
import { getValidAccessToken, ProviderNotConnectedError, ProviderReconnectRequiredError } from "@/lib/integrations/tokens";
import { updateCalendarEvent } from "@/lib/integrations/google/calendar";
import { updateMeetingInputSchema } from "@/lib/meetings/schema";
import type { ScheduledMeeting } from "@/types/database";

export type UpdateMeetingResult = { meeting: ScheduledMeeting; error: null } | { meeting: null; error: string };

/**
 * Updates the provider meeting (if the provider supports it — Google Meet
 * has none of its own) and the Google Calendar event, then the database
 * row. If the meeting's provider changed since creation, this still just
 * updates the Calendar event's embedded URL/conference — switching
 * providers on an existing meeting isn't supported in this pass; the UI
 * only offers editing time/title/attendees, not re-selecting a provider.
 */
export async function updateMeeting(userId: string, rawInput: unknown): Promise<UpdateMeetingResult> {
  const parsed = updateMeetingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { meeting: null, error: parsed.error.issues[0]?.message ?? "Invalid meeting details." };
  }
  const input = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("scheduled_meetings")
    .select("*")
    .eq("id", input.meetingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) return { meeting: null, error: "Meeting not found." };
  if (existing.status === "cancelled") return { meeting: null, error: "This meeting was cancelled." };

  let meetingUrl = existing.meeting_url;

  if (existing.provider !== "google_meet" && existing.provider_meeting_id) {
    try {
      const provider = getMeetingProvider(existing.provider);
      const result = await provider.updateMeeting(userId, existing.provider_meeting_id, {
        title: input.title,
        description: input.description,
        startTimeIso: input.startTime,
        endTimeIso: input.endTime,
        timezone: input.timezone,
        zoomOptions: input.zoomOptions,
      });
      if (result.meetingUrl) meetingUrl = result.meetingUrl;
    } catch (error) {
      return { meeting: null, error: reconnectOrGenericMessage(error, existing.provider) };
    }
  }

  let googleAccessToken: string;
  try {
    googleAccessToken = await getValidAccessToken(userId, "google");
  } catch (error) {
    return { meeting: null, error: reconnectOrGenericMessage(error, "google_meet") };
  }

  if (existing.google_calendar_event_id) {
    try {
      const event = await updateCalendarEvent(googleAccessToken, existing.google_calendar_event_id, {
        title: input.title,
        description: input.description,
        location: input.location,
        startTimeIso: input.startTime,
        endTimeIso: input.endTime,
        timezone: input.timezone,
        attendees: input.attendees.filter((a) => a.email).map((a) => ({ name: a.name || null, email: a.email })),
        createMeetLink: existing.provider === "google_meet",
        externalMeetingUrl: existing.provider === "google_meet" ? null : meetingUrl,
      });
      if (existing.provider === "google_meet" && event.meetUrl) meetingUrl = event.meetUrl;
    } catch {
      // Provider meeting already reflects the new details at this point —
      // mark for reconciliation rather than silently leaving Calendar stale.
      await supabase
        .from("scheduled_meetings")
        .update({ sync_error: "Calendar update failed — provider meeting and calendar may be out of sync." })
        .eq("id", input.meetingId);
      return { meeting: null, error: "The meeting was updated, but the calendar event couldn't be synchronized." };
    }
  }

  await supabase.from("scheduled_meeting_attendees").delete().eq("meeting_id", input.meetingId);
  if (input.attendees.length > 0) {
    await supabase.from("scheduled_meeting_attendees").insert(
      input.attendees.map((a) => ({ meeting_id: input.meetingId, name: a.name || null, email: a.email, status: "pending" as const }))
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("scheduled_meetings")
    .update({
      title: input.title,
      description: input.description || null,
      location: input.location || null,
      start_time: input.startTime,
      end_time: input.endTime,
      timezone: input.timezone,
      meeting_url: meetingUrl,
      sync_error: null,
    })
    .eq("id", input.meetingId)
    .select("*")
    .single();

  if (updateError || !updated) {
    return { meeting: null, error: "Failed to save the updated meeting." };
  }

  return { meeting: updated, error: null };
}

function reconnectOrGenericMessage(error: unknown, provider: string): string {
  if (error instanceof ProviderNotConnectedError) return `${provider} is not connected. Reconnect it in Settings → Integrations.`;
  if (error instanceof ProviderReconnectRequiredError) return `${provider} needs to be reconnected. Go to Settings → Integrations.`;
  console.error("[updateMeeting] failed", provider, error instanceof Error ? error.message : error);
  return "Failed to update the meeting. Please try again.";
}
