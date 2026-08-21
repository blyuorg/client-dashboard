import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ConversationParticipant, ConversationSummary, MessageView } from "@/lib/messages/types";
import { MESSAGE_PAGE_SIZE } from "@/lib/messages/types";
import type { Profile } from "@/types/database";

function toParticipant(profile: Pick<Profile, "id" | "role" | "full_name" | "owner_name" | "email" | "avatar_url">): ConversationParticipant {
  return {
    id: profile.id,
    name: profile.full_name || profile.owner_name || profile.email,
    role: profile.role,
    email: profile.email,
    avatarUrl: profile.avatar_url,
  };
}

const PARTICIPANT_COLUMNS = "id, role, full_name, owner_name, email, avatar_url";

/**
 * Resolves (and, if needed, self-heals) the single conversation a client
 * participates in. Conversations can only be inserted/updated by an admin
 * session under RLS (`conversations_admin_*`), which normally happens as a
 * side effect of `updateClientProfile` setting `assigned_admin_id`. This
 * covers the case where that column was set some other way (direct SQL,
 * data import) and the conversation row never got created/synced — using
 * the service-role client, but only ever writing values read back from the
 * authenticated user's own profile row, never anything client-supplied.
 */
export async function getOrHealClientConversation(userId: string, assignedAdminId: string | null) {
  const supabase = await createClient();

  if (!assignedAdminId) return null;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id, client_id, assigned_admin_id, created_at, updated_at")
    .eq("client_id", userId)
    .maybeSingle();

  if (existing && existing.assigned_admin_id === assignedAdminId) return existing;

  const admin = createAdminClient();
  const { data: healed, error } = await admin
    .from("conversations")
    .upsert({ client_id: userId, assigned_admin_id: assignedAdminId }, { onConflict: "client_id" })
    .select("id, client_id, assigned_admin_id, created_at, updated_at")
    .single();

  if (error || !healed) return existing ?? null;
  return healed;
}

export async function getConversationParticipants(clientId: string, assignedAdminId: string) {
  const supabase = await createClient();
  const [{ data: client }, { data: admin }] = await Promise.all([
    supabase.from("profiles").select(PARTICIPANT_COLUMNS).eq("id", clientId).single(),
    supabase.from("profiles").select(PARTICIPANT_COLUMNS).eq("id", assignedAdminId).single(),
  ]);

  return {
    client: client ? toParticipant(client) : null,
    assignedAdmin: admin ? toParticipant(admin) : null,
  };
}

export async function getConversationMessages(
  conversationId: string,
  currentUserId: string,
  before?: string
): Promise<MessageView[]> {
  const supabase = await createClient();
  let query = supabase
    .from("direct_messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);

  if (before) query = query.lt("created_at", before);

  const { data } = await query;

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      body: row.body,
      createdAt: row.created_at,
      readAt: row.read_at,
      isMine: row.sender_id === currentUserId,
    }))
    .reverse();
}

/** Admin/team view: every conversation they can see, most recently active first. */
export async function listAdminConversations(currentUserId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, client_id, assigned_admin_id, updated_at")
    .order("updated_at", { ascending: false });

  if (!conversations || conversations.length === 0) return [];

  const participantIds = Array.from(
    new Set(conversations.flatMap((c) => [c.client_id, c.assigned_admin_id]))
  );
  const conversationIds = conversations.map((c) => c.id);

  const [{ data: profiles }, { data: lastMessages }, { data: unread }] = await Promise.all([
    supabase.from("profiles").select(PARTICIPANT_COLUMNS).in("id", participantIds),
    supabase
      .from("direct_messages")
      .select("conversation_id, body, created_at, sender_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("direct_messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds)
      .is("read_at", null)
      .neq("sender_id", currentUserId),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, toParticipant(p)]));
  const lastMessageByConversation = new Map<string, { body: string; createdAt: string; isMine: boolean }>();
  for (const message of lastMessages ?? []) {
    if (!lastMessageByConversation.has(message.conversation_id)) {
      lastMessageByConversation.set(message.conversation_id, {
        body: message.body,
        createdAt: message.created_at,
        isMine: message.sender_id === currentUserId,
      });
    }
  }
  const unreadCountByConversation = new Map<string, number>();
  for (const row of unread ?? []) {
    unreadCountByConversation.set(row.conversation_id, (unreadCountByConversation.get(row.conversation_id) ?? 0) + 1);
  }

  return conversations
    .map((conversation) => {
      const client = profileById.get(conversation.client_id);
      const assignedAdmin = profileById.get(conversation.assigned_admin_id);
      if (!client || !assignedAdmin) return null;
      return {
        id: conversation.id,
        client,
        assignedAdmin,
        updatedAt: conversation.updated_at,
        lastMessage: lastMessageByConversation.get(conversation.id) ?? null,
        unreadCount: unreadCountByConversation.get(conversation.id) ?? 0,
      };
    })
    .filter((c): c is ConversationSummary => c !== null);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("direct_messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .neq("sender_id", userId);
  return count ?? 0;
}
