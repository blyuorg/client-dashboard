import "server-only";

const ZOOM_API = "https://api.zoom.us/v2";

export type ZoomMeetingInput = {
  title: string;
  agenda?: string | null;
  startTimeIso: string;
  durationMinutes: number;
  timezone: string;
  waitingRoom: boolean;
  joinBeforeHost: boolean;
  hostVideo: boolean;
  participantVideo: boolean;
};

export type ZoomMeetingResult = {
  meetingId: string;
  joinUrl: string;
};

async function zoomRequest(accessToken: string, path: string, init?: RequestInit) {
  const response = await fetch(`${ZOOM_API}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("[zoom meetings] request failed", { path, status: response.status, body: body.slice(0, 500) });
    throw new Error(`Zoom request failed (${response.status}).`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function buildMeetingBody(input: ZoomMeetingInput) {
  return {
    topic: input.title,
    agenda: input.agenda ?? undefined,
    type: 2, // scheduled meeting
    start_time: input.startTimeIso,
    duration: input.durationMinutes,
    timezone: input.timezone,
    settings: {
      waiting_room: input.waitingRoom,
      join_before_host: input.joinBeforeHost,
      host_video: input.hostVideo,
      participant_video: input.participantVideo,
    },
  };
}

export async function createZoomMeeting(accessToken: string, input: ZoomMeetingInput): Promise<ZoomMeetingResult> {
  const meeting = await zoomRequest(accessToken, "/users/me/meetings", {
    method: "POST",
    body: JSON.stringify(buildMeetingBody(input)),
  });
  return { meetingId: String(meeting.id), joinUrl: meeting.join_url };
}

export async function updateZoomMeeting(accessToken: string, meetingId: string, input: ZoomMeetingInput): Promise<void> {
  await zoomRequest(accessToken, `/meetings/${meetingId}`, {
    method: "PATCH",
    body: JSON.stringify(buildMeetingBody(input)),
  });
}

export async function deleteZoomMeeting(accessToken: string, meetingId: string): Promise<void> {
  await zoomRequest(accessToken, `/meetings/${meetingId}`, { method: "DELETE" }).catch((error) => {
    console.error("[zoom meetings] delete failed", error instanceof Error ? error.message : error);
  });
}
