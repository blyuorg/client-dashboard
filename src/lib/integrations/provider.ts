import "server-only";
import { getValidAccessToken } from "@/lib/integrations/tokens";
import { createZoomMeeting, updateZoomMeeting, deleteZoomMeeting } from "@/lib/integrations/zoom/meetings";
import { createTeamsMeeting, updateTeamsMeeting, deleteTeamsMeeting } from "@/lib/integrations/microsoft/teams";
import type { MeetingProviderKind } from "@/types/database";

export type ZoomOptions = {
  waitingRoom: boolean;
  joinBeforeHost: boolean;
  hostVideo: boolean;
  participantVideo: boolean;
};

export type MeetingInput = {
  title: string;
  description?: string | null;
  startTimeIso: string;
  endTimeIso: string;
  timezone: string;
  zoomOptions?: ZoomOptions;
};

export type MeetingResult = {
  providerMeetingId: string | null;
  meetingUrl: string | null;
};

/**
 * A provider "meeting" is the video-conference resource itself (Zoom
 * meeting, Teams online meeting). Google Meet is the odd one out: its
 * link is generated as part of the Google Calendar event, not a separate
 * resource, so GoogleMeetProvider is intentionally a no-op here — the
 * orchestrator in createMeeting.ts asks Google Calendar for the Meet link
 * directly instead of calling this.
 */
export interface MeetingProvider {
  createMeeting(userId: string, input: MeetingInput): Promise<MeetingResult>;
  updateMeeting(userId: string, providerMeetingId: string, input: MeetingInput): Promise<MeetingResult>;
  deleteMeeting(userId: string, providerMeetingId: string): Promise<void>;
}

export class GoogleMeetProvider implements MeetingProvider {
  async createMeeting(): Promise<MeetingResult> {
    return { providerMeetingId: null, meetingUrl: null };
  }
  async updateMeeting(): Promise<MeetingResult> {
    return { providerMeetingId: null, meetingUrl: null };
  }
  async deleteMeeting(): Promise<void> {
    // Nothing to do — the Meet link dies with the Calendar event.
  }
}

function durationMinutes(startIso: string, endIso: string): number {
  return Math.max(1, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
}

export class ZoomProvider implements MeetingProvider {
  async createMeeting(userId: string, input: MeetingInput): Promise<MeetingResult> {
    const accessToken = await getValidAccessToken(userId, "zoom");
    const result = await createZoomMeeting(accessToken, {
      title: input.title,
      agenda: input.description,
      startTimeIso: input.startTimeIso,
      durationMinutes: durationMinutes(input.startTimeIso, input.endTimeIso),
      timezone: input.timezone,
      waitingRoom: input.zoomOptions?.waitingRoom ?? true,
      joinBeforeHost: input.zoomOptions?.joinBeforeHost ?? false,
      hostVideo: input.zoomOptions?.hostVideo ?? true,
      participantVideo: input.zoomOptions?.participantVideo ?? true,
    });
    return { providerMeetingId: result.meetingId, meetingUrl: result.joinUrl };
  }

  async updateMeeting(userId: string, providerMeetingId: string, input: MeetingInput): Promise<MeetingResult> {
    const accessToken = await getValidAccessToken(userId, "zoom");
    await updateZoomMeeting(accessToken, providerMeetingId, {
      title: input.title,
      agenda: input.description,
      startTimeIso: input.startTimeIso,
      durationMinutes: durationMinutes(input.startTimeIso, input.endTimeIso),
      timezone: input.timezone,
      waitingRoom: input.zoomOptions?.waitingRoom ?? true,
      joinBeforeHost: input.zoomOptions?.joinBeforeHost ?? false,
      hostVideo: input.zoomOptions?.hostVideo ?? true,
      participantVideo: input.zoomOptions?.participantVideo ?? true,
    });
    return { providerMeetingId, meetingUrl: null };
  }

  async deleteMeeting(userId: string, providerMeetingId: string): Promise<void> {
    const accessToken = await getValidAccessToken(userId, "zoom");
    await deleteZoomMeeting(accessToken, providerMeetingId);
  }
}

export class MicrosoftTeamsProvider implements MeetingProvider {
  async createMeeting(userId: string, input: MeetingInput): Promise<MeetingResult> {
    const accessToken = await getValidAccessToken(userId, "microsoft");
    const result = await createTeamsMeeting(accessToken, {
      title: input.title,
      startTimeIso: input.startTimeIso,
      endTimeIso: input.endTimeIso,
    });
    return { providerMeetingId: result.meetingId, meetingUrl: result.joinUrl };
  }

  async updateMeeting(userId: string, providerMeetingId: string, input: MeetingInput): Promise<MeetingResult> {
    const accessToken = await getValidAccessToken(userId, "microsoft");
    await updateTeamsMeeting(accessToken, providerMeetingId, {
      title: input.title,
      startTimeIso: input.startTimeIso,
      endTimeIso: input.endTimeIso,
    });
    return { providerMeetingId, meetingUrl: null };
  }

  async deleteMeeting(userId: string, providerMeetingId: string): Promise<void> {
    const accessToken = await getValidAccessToken(userId, "microsoft");
    await deleteTeamsMeeting(accessToken, providerMeetingId);
  }
}

export function getMeetingProvider(kind: MeetingProviderKind): MeetingProvider {
  switch (kind) {
    case "google_meet":
      return new GoogleMeetProvider();
    case "zoom":
      return new ZoomProvider();
    case "microsoft_teams":
      return new MicrosoftTeamsProvider();
  }
}
