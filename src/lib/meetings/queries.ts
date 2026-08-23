import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ScheduledMeeting, ScheduledMeetingAttendee } from "@/types/database";

export type MeetingWithAttendees = ScheduledMeeting & { attendees: ScheduledMeetingAttendee[] };

export async function listUpcomingMeetings(userId: string): Promise<MeetingWithAttendees[]> {
  const supabase = await createClient();
  const { data: meetings } = await supabase
    .from("scheduled_meetings")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  if (!meetings || meetings.length === 0) return [];

  const { data: attendees } = await supabase
    .from("scheduled_meeting_attendees")
    .select("*")
    .in(
      "meeting_id",
      meetings.map((m) => m.id)
    );

  const attendeesByMeeting = new Map<string, ScheduledMeetingAttendee[]>();
  for (const attendee of attendees ?? []) {
    const list = attendeesByMeeting.get(attendee.meeting_id) ?? [];
    list.push(attendee);
    attendeesByMeeting.set(attendee.meeting_id, list);
  }

  return meetings.map((meeting) => ({ ...meeting, attendees: attendeesByMeeting.get(meeting.id) ?? [] }));
}

