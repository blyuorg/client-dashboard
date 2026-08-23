import "server-only";

const GRAPH_API = "https://graph.microsoft.com/v1.0";

export type TeamsMeetingInput = {
  title: string;
  startTimeIso: string;
  endTimeIso: string;
};

export type TeamsMeetingResult = {
  meetingId: string;
  joinUrl: string;
};

async function graphRequest(accessToken: string, path: string, init?: RequestInit) {
  const response = await fetch(`${GRAPH_API}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("[microsoft teams] request failed", { path, status: response.status, body: body.slice(0, 500) });
    throw new Error(`Microsoft Graph request failed (${response.status}).`);
  }
  if (response.status === 204) return null;
  return response.json();
}

// Teams meetings are created via /me/onlineMeetings, independent of any
// Graph calendar event — this app uses Google Calendar as the single
// system of record for the actual scheduled invite/attendees (see
// src/lib/meetings/createMeeting.ts), so Teams' own calendaring isn't
// used at all here, only its meeting/conference creation.
export async function createTeamsMeeting(accessToken: string, input: TeamsMeetingInput): Promise<TeamsMeetingResult> {
  const meeting = await graphRequest(accessToken, "/me/onlineMeetings", {
    method: "POST",
    body: JSON.stringify({
      subject: input.title,
      startDateTime: input.startTimeIso,
      endDateTime: input.endTimeIso,
    }),
  });
  return { meetingId: meeting.id, joinUrl: meeting.joinWebUrl };
}

export async function updateTeamsMeeting(accessToken: string, meetingId: string, input: TeamsMeetingInput): Promise<void> {
  await graphRequest(accessToken, `/me/onlineMeetings/${encodeURIComponent(meetingId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      subject: input.title,
      startDateTime: input.startTimeIso,
      endDateTime: input.endTimeIso,
    }),
  });
}

export async function deleteTeamsMeeting(accessToken: string, meetingId: string): Promise<void> {
  await graphRequest(accessToken, `/me/onlineMeetings/${encodeURIComponent(meetingId)}`, { method: "DELETE" }).catch((error) => {
    console.error("[microsoft teams] delete failed", error instanceof Error ? error.message : error);
  });
}
