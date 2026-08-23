"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createMeeting } from "@/lib/meetings/createMeeting";
import { updateMeeting } from "@/lib/meetings/updateMeeting";
import { cancelMeeting } from "@/lib/meetings/cancelMeeting";
import type { ScheduledMeeting } from "@/types/database";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function createMeetingAction(input: unknown): Promise<{ meeting: ScheduledMeeting | null; error: string | null }> {
  const user = await requireUser();
  if (!user) return { meeting: null, error: "Your session has expired. Please log in again." };

  const result = await createMeeting(user.id, input);
  if (result.meeting) revalidatePath("/meetings");
  return result;
}

export async function updateMeetingAction(input: unknown): Promise<{ meeting: ScheduledMeeting | null; error: string | null }> {
  const user = await requireUser();
  if (!user) return { meeting: null, error: "Your session has expired. Please log in again." };

  const result = await updateMeeting(user.id, input);
  if (result.meeting) revalidatePath("/meetings");
  return result;
}

export async function cancelMeetingAction(meetingId: string): Promise<{ error: string | null }> {
  const user = await requireUser();
  if (!user) return { error: "Your session has expired. Please log in again." };

  const result = await cancelMeeting(user.id, meetingId);
  revalidatePath("/meetings");
  return result;
}
