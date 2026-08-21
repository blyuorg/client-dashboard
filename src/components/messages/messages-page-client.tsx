"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationPanel } from "@/components/messages/conversation-panel";
import { NoConversationSelectedEmptyState, NoConversationsEmptyState } from "@/components/messages/empty-states";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ConversationSummary, MessageView } from "@/lib/messages/types";

export function AdminMessagesPageClient({
  currentUserId,
  conversations,
  initialConversationId,
  initialMessages,
}: {
  currentUserId: string;
  conversations: ConversationSummary[];
  initialConversationId: string | null;
  initialMessages: MessageView[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, MessageView[]>>(
    initialConversationId ? { [initialConversationId]: initialMessages } : {}
  );
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  async function handleSelect(conversationId: string) {
    setSelectedId(conversationId);
    if (messagesByConversation[conversationId]) return;

    setLoadingConversationId(conversationId);
    const supabase = createClient();
    const { data } = await supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(30);

    const messages = (data ?? [])
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

    setMessagesByConversation((prev) => ({ ...prev, [conversationId]: messages }));
    setLoadingConversationId(null);
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-9rem)] items-center justify-center rounded-2xl border border-border bg-background">
        <NoConversationsEmptyState />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-border bg-background">
      <div className={cn("w-full shrink-0 border-r border-border sm:w-80", selected && "hidden sm:block")}>
        <ConversationList conversations={conversations} selectedId={selectedId} onSelect={handleSelect} />
      </div>

      <div className={cn("min-w-0 flex-1", !selected && "hidden sm:flex")}>
        {selected ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-border p-2 sm:hidden">
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to conversations
              </Button>
            </div>
            {loadingConversationId === selected.id && !messagesByConversation[selected.id] ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ConversationPanel
                conversationId={selected.id}
                currentUserId={currentUserId}
                otherParticipant={selected.client}
                initialMessages={messagesByConversation[selected.id] ?? []}
              />
            )}
          </div>
        ) : (
          <NoConversationSelectedEmptyState />
        )}
      </div>
    </div>
  );
}
