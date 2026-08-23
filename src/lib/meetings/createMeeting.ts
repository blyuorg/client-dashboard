import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getMeetingProvider } from "@/lib/integrations/provider";
import { getValidAccessToken, ProviderNotConnectedError, ProviderReconnectRequiredError } from "@/lib/integrations/tokens";
import { createCalendarEvent } from "@/lib/integrations/google/calendar";
import { meetingInputSchema, type MeetingInputValues } from "@/lib/meetings/schema";
import type { ScheduledMeeting } from "@/types/database";

export type CreateMeetingResult = { meeting: ScheduledMeeting; error: null } | { meeting: null; error: string };

const PROVIDER_LABEL: Record<MeetingInputValues["provider"], string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  microsoft_teams: "Microsoft Teams",
};

/**
 * Orchestrates the full "schedule a meeting" flow (spec section 13):
 * validate → check provider connection → create the provider meeting
 * (Zoom/Teams) or skip straight to Calendar (Google Meet, whose link is
 * generated as part of the event) → create the Google Calendar event with
 * that URL embedded → persist. Google Calendar is always required since
 * it's the single system of record for the actual invite, regardless of
 * which video provider was chosen.
 *
 * On partial failure (provider meeting created but Calendar event
 * creation fails), the provider meeting is rolled back so nothing orphaned
 * is left holding a slot on the user's Zoom/Teams account silently.
 */
export async function createMeeting(userId: string, rawInput: unknown): Promise<CreateMeetingResult> {
  const parsed = meetingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { meeting: null, error: parsed.error.issues[0]?.message ?? "Invalid meeting details." };
  }
  const input = parsed.data;
  const supabase = await createClient();

  // Idempotency: if a previous attempt with this exact key already
  // produced a meeting (e.g. a double-click or a retried request after a
  // dropped response), return that one instead of creating a duplicate.
  const { data: existing } = await supabase
    .from("scheduled_meetings")
    .select("*")
    .eq("user_id", userId)
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (existing) return { meeting: existing, error: null };

  let googleAccessToken: string;
  try {
    googleAccessToken = await getValidAccessToken(userId, "google");
  } catch (error) {
    return { meeting: null, error: reconnectMessage(error, "google") };
  }

  const isGoogleMeet = input.provider === "google_meet";
  let providerMeetingId: string | null = null;
  let meetingUrl: string | null = null;

  if (!isGoogleMeet) {
    try {
      const provider = getMeetingProvider(input.provider);
      const result = await provider.createMeeting(userId, {
        title: input.title,
        description: input.description,
        startTimeIso: input.startTime,
        endTimeIso: input.endTime,
        timezone: input.timezone,
        zoomOptions: input.zoomOptions,
      });
      providerMeetingId = result.providerMeetingId;
      meetingUrl = result.meetingUrl;
    } catch (error) {
      return { meeting: null, error: providerErrorMessage(error, input.provider) };
    }
  }

  let calendarEventId: string;
  try {
    const event = await createCalendarEvent(googleAccessToken, {
      title: input.title,
      description: input.description,
      location: input.location,
      startTimeIso: input.startTime,
      endTimeIso: input.endTime,
      timezone: input.timezone,
      attendees: input.attendees.filter((a) => a.email).map((a) => ({ name: a.name || null, email: a.email })),
      createMeetLink: isGoogleMeet,
      externalMeetingUrl: meetingUrl,
    });
    calendarEventId = event.eventId;
    if (isGoogleMeet) meetingUrl = event.meetUrl;
  } catch {
    // Roll back the provider meeting so a failed schedule doesn't leave a
    // live Zoom/Teams meeting nobody knows about.
    if (!isGoogleMeet && providerMeetingId) {
      await getMeetingProvider(input.provider)
        .deleteMeeting(userId, providerMeetingId)
        .catch((rollbackError) =>
          console.error("[createMeeting] rollback failed", input.provider, rollbackError instanceof Error ? rollbackError.message : rollbackError)
        );
    }
    return { meeting: null, error: "Failed to create the calendar event. Please try again." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("scheduled_meetings")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      provider: input.provider,
      meeting_url: meetingUrl,
      provider_meeting_id: providerMeetingId,
      google_calendar_event_id: calendarEventId,
      location: input.location || null,
      start_time: input.startTime,
      end_time: input.endTime,
      timezone: input.timezone,
      status: "scheduled",
      idempotency_key: input.idempotencyKey,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    console.error("[createMeeting] db insert failed after provider success — meeting created but not recorded", {
      userId,
      provider: input.provider,
      providerMeetingId,
      calendarEventId,
      error: insertError?.message,
    });
    return {
      meeting: null,
      error: "The meeting was created but couldn't be saved. It may still exist on your calendar — please check before retrying.",
    };
  }

  if (input.attendees.length > 0) {
    await supabase.from("scheduled_meeting_attendees").insert(
      input.attendees.map((a) => ({ meeting_id: inserted.id, name: a.name || null, email: a.email, status: "pending" as const }))
    );
  }

  return { meeting: inserted, error: null };
}

function reconnectMessage(error: unknown, provider: string): string {
  if (error instanceof ProviderNotConnectedError) return `${labelFor(provider)} is not connected. Connect it in Settings → Integrations.`;
  if (error instanceof ProviderReconnectRequiredError) return `${labelFor(provider)} needs to be reconnected. Go to Settings → Integrations.`;
  console.error("[createMeeting] unexpected token error", error instanceof Error ? error.message : error);
  return `Couldn't verify your ${labelFor(provider)} connection. Please try again.`;
}

function providerErrorMessage(error: unknown, provider: MeetingInputValues["provider"]): string {
  if (error instanceof ProviderNotConnectedError || error instanceof ProviderReconnectRequiredError) {
    return reconnectMessage(error, error.provider);
  }
  console.error(`[createMeeting] ${provider} meeting creation failed`, error instanceof Error ? error.message : error);
  return `Failed to create the ${PROVIDER_LABEL[provider]} meeting. Please try again.`;
}

function labelFor(provider: string): string {
  if (provider === "google") return "Google Calendar";
  if (provider === "zoom") return "Zoom";
  if (provider === "microsoft") return "Microsoft Teams";
  return provider;
}
