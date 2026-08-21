import { createClient, getUser } from "@/lib/supabase/server";
import {
  getConversationMessages,
  getConversationParticipants,
  getOrHealClientConversation,
  listAdminConversations,
} from "@/lib/messages/queries";
import { ConversationPanel } from "@/components/messages/conversation-panel";
import { NoAssignmentEmptyState } from "@/components/messages/empty-states";
import { AdminMessagesPageClient } from "@/components/messages/messages-page-client";
import type { PrivacyPreferences } from "@/lib/settings/types";

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) return null; // (dashboard) layout already redirects unauthenticated users to /login.

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, assigned_admin_id, preferences")
    .eq("id", user.id)
    .single();

  const showOnlineStatus = (profile?.preferences?.privacy as PrivacyPreferences | undefined)?.showOnlineStatus ?? true;

  if (profile?.role === "admin") {
    const conversations = await listAdminConversations(user.id);
    const initialConversationId = conversations[0]?.id ?? null;
    const initialMessages = initialConversationId
      ? await getConversationMessages(initialConversationId, user.id)
      : [];

    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl">Messages</h1>
          <p className="text-sm text-muted-foreground">1-to-1 conversations with your assigned clients.</p>
        </div>
        <AdminMessagesPageClient
          currentUserId={user.id}
          conversations={conversations}
          initialConversationId={initialConversationId}
          initialMessages={initialMessages}
          showOnlineStatus={showOnlineStatus}
        />
      </div>
    );
  }

  const conversation = await getOrHealClientConversation(user.id, profile?.assigned_admin_id ?? null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">Messages</h1>
        <p className="text-sm text-muted-foreground">A private conversation with your assigned project manager.</p>
      </div>
      <div className="h-[calc(100vh-11rem)] overflow-hidden rounded-2xl border border-border bg-background">
        {conversation ? (
          <ConversationPanelWithParticipant
            conversationId={conversation.id}
            clientId={user.id}
            assignedAdminId={conversation.assigned_admin_id}
            showOnlineStatus={showOnlineStatus}
          />
        ) : (
          <NoAssignmentEmptyState />
        )}
      </div>
    </div>
  );
}

async function ConversationPanelWithParticipant({
  conversationId,
  clientId,
  assignedAdminId,
  showOnlineStatus,
}: {
  conversationId: string;
  clientId: string;
  assignedAdminId: string;
  showOnlineStatus: boolean;
}) {
  const [{ assignedAdmin }, initialMessages] = await Promise.all([
    getConversationParticipants(clientId, assignedAdminId),
    getConversationMessages(conversationId, clientId),
  ]);

  if (!assignedAdmin) return <NoAssignmentEmptyState />;

  return (
    <ConversationPanel
      conversationId={conversationId}
      currentUserId={clientId}
      otherParticipant={assignedAdmin}
      initialMessages={initialMessages}
      showOnlineStatus={showOnlineStatus}
    />
  );
}
