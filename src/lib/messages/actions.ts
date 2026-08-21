"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadableErrorMessage } from "@/lib/supabase/errors";
import { MESSAGE_MAX_LENGTH } from "@/lib/messages/types";
import type { MessageView } from "@/lib/messages/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Your session has expired. Please log in again." };
  return { supabase, user, error: null };
}

/**
 * Loads the conversation and verifies `userId` is one of its two
 * participants (or an admin) — every mutation below calls this first.
 * `conversationId` and every other id here comes from the authenticated
 * caller's own request, never trusted at face value: RLS on `conversations`
 * independently re-enforces the same participant check, so this is the
 * "give a clean error" layer, not the only layer.
 */
async function loadAuthorizedConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  userId: string
) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, client_id, assigned_admin_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) return null;
  if (conversation.client_id !== userId && conversation.assigned_admin_id !== userId) {
    // Covers admins with blanket access too — a select that returned a row
    // for them here still means they're allowed to act on it.
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== "admin") return null;
  }
  return conversation;
}

const RATE_LIMIT_WINDOW_SECONDS = 10;
const RATE_LIMIT_MAX_MESSAGES = 15;

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ error: string | null; message?: MessageView }> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return { error: authError };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Message can't be empty." };
  if (trimmed.length > MESSAGE_MAX_LENGTH) return { error: `Messages can't be longer than ${MESSAGE_MAX_LENGTH} characters.` };

  const conversation = await loadAuthorizedConversation(supabase, conversationId, user.id);
  if (!conversation) return { error: "You don't have access to this conversation." };

  // Stateless rate limit: no in-memory counters survive across serverless
  // invocations, so ask the database — it's the one thing guaranteed to be
  // consistent across every instance handling this user's requests.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("direct_messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id)
    .gte("created_at", windowStart);
  if ((recentCount ?? 0) >= RATE_LIMIT_MAX_MESSAGES) {
    return { error: "You're sending messages too fast. Please wait a moment." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("direct_messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: trimmed })
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .single();

  if (insertError || !inserted) return { error: getReadableErrorMessage(insertError) };

  const receiverId = conversation.client_id === user.id ? conversation.assigned_admin_id : conversation.client_id;
  const { data: sender } = await supabase.from("profiles").select("full_name, owner_name, email").eq("id", user.id).single();
  const senderName = sender?.full_name || sender?.owner_name || sender?.email || "Someone";

  await supabase.from("notifications").insert({
    user_id: receiverId,
    type: "new_message",
    title: `New message from ${senderName}`,
    body: trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed,
    reference_id: conversationId,
  });

  revalidatePath("/messages");

  return {
    error: null,
    message: {
      id: inserted.id,
      conversationId: inserted.conversation_id,
      senderId: inserted.sender_id,
      body: inserted.body,
      createdAt: inserted.created_at,
      readAt: inserted.read_at,
      isMine: true,
    },
  };
}

export async function markConversationRead(conversationId: string): Promise<{ error: string | null }> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return { error: authError };

  const conversation = await loadAuthorizedConversation(supabase, conversationId, user.id);
  if (!conversation) return { error: "You don't have access to this conversation." };

  const { error } = await supabase
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("read_at", null)
    .neq("sender_id", user.id);

  if (error) return { error: getReadableErrorMessage(error) };

  revalidatePath("/messages");
  return { error: null };
}
