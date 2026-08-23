import type { ScheduledMeeting } from "@/types/database";

export type DisplayMeetingStatus = "cancelled" | "completed" | "in_progress" | "starting_soon" | "upcoming";

const STARTING_SOON_WINDOW_MS = 15 * 60 * 1000;

/** Pure — safe to import from Client Components, unlike queries.ts (which touches Supabase and is server-only). */
export function computeDisplayStatus(meeting: Pick<ScheduledMeeting, "status" | "start_time" | "end_time">): DisplayMeetingStatus {
  if (meeting.status === "cancelled") return "cancelled";
  const now = Date.now();
  const start = new Date(meeting.start_time).getTime();
  const end = new Date(meeting.end_time).getTime();

  if (now > end) return "completed";
  if (now >= start && now <= end) return "in_progress";
  if (start - now <= STARTING_SOON_WINDOW_MS) return "starting_soon";
  return "upcoming";
}
