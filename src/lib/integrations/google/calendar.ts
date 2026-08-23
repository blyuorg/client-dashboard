import "server-only";
import { randomUUID } from "crypto";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export type CalendarEventInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  startTimeIso: string;
  endTimeIso: string;
  timezone: string;
  attendees: { name?: string | null; email: string }[];
  /** When true, asks Google Calendar to generate a Google Meet link via conferenceData. */
  createMeetLink: boolean;
  /** For Zoom/Teams meetings, the join URL to surface in the event description/location. */
  externalMeetingUrl?: string | null;
};

export type CalendarEventResult = {
  eventId: string;
  htmlLink: string;
  meetUrl: string | null;
};

async function calendarRequest(accessToken: string, path: string, init?: RequestInit) {
  const response = await fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("[google calendar] request failed", { path, status: response.status, body: body.slice(0, 500) });
    throw new Error(`Google Calendar request failed (${response.status}).`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function buildEventBody(input: CalendarEventInput) {
  const description = [input.description?.trim(), input.externalMeetingUrl ? `Join: ${input.externalMeetingUrl}` : null]
    .filter(Boolean)
    .join("\n\n");

  const body: Record<string, unknown> = {
    summary: input.title,
    description: description || undefined,
    location: input.externalMeetingUrl ?? input.location ?? undefined,
    start: { dateTime: input.startTimeIso, timeZone: input.timezone },
    end: { dateTime: input.endTimeIso, timeZone: input.timezone },
    attendees: input.attendees.map((a) => ({ email: a.email, displayName: a.name ?? undefined })),
    reminders: { useDefault: true },
  };

  if (input.createMeetLink) {
    body.conferenceData = {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  return body;
}

function extractMeetUrl(event: Record<string, unknown>): string | null {
  const conferenceData = event.conferenceData as { entryPoints?: { entryPointType: string; uri: string }[] } | undefined;
  const videoEntry = conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video");
  return videoEntry?.uri ?? null;
}

export async function createCalendarEvent(accessToken: string, input: CalendarEventInput): Promise<CalendarEventResult> {
  const params = new URLSearchParams({ sendUpdates: "all" });
  if (input.createMeetLink) params.set("conferenceDataVersion", "1");

  const event = await calendarRequest(accessToken, `/calendars/primary/events?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify(buildEventBody(input)),
  });

  return { eventId: event.id, htmlLink: event.htmlLink, meetUrl: extractMeetUrl(event) };
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  input: CalendarEventInput
): Promise<CalendarEventResult> {
  const params = new URLSearchParams({ sendUpdates: "all" });
  if (input.createMeetLink) params.set("conferenceDataVersion", "1");

  const event = await calendarRequest(accessToken, `/calendars/primary/events/${eventId}?${params.toString()}`, {
    method: "PATCH",
    body: JSON.stringify(buildEventBody(input)),
  });

  return { eventId: event.id, htmlLink: event.htmlLink, meetUrl: extractMeetUrl(event) };
}

export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const params = new URLSearchParams({ sendUpdates: "all" });
  await calendarRequest(accessToken, `/calendars/primary/events/${eventId}?${params.toString()}`, { method: "DELETE" }).catch(
    (error) => {
      // A 404 here (event already gone) shouldn't block cancelling the
      // meeting in our own database — log and move on.
      console.error("[google calendar] delete failed", error instanceof Error ? error.message : error);
    }
  );
}

export async function getCalendarEvent(accessToken: string, eventId: string) {
  return calendarRequest(accessToken, `/calendars/primary/events/${eventId}`);
}
