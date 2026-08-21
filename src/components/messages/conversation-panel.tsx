"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/lib/messages/actions";
import { MESSAGE_PAGE_SIZE } from "@/lib/messages/types";
import type { ConversationParticipant, MessageView } from "@/lib/messages/types";
import { ConversationHeader } from "@/components/messages/conversation-header";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";
import { DateSeparator, isSameCalendarDay } from "@/components/messages/date-separator";
import { StartConversationEmptyState } from "@/components/messages/empty-states";
import { toast } from "@/hooks/use-toast";

export function ConversationPanel({
  conversationId,
  currentUserId,
  otherParticipant,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherParticipant: ConversationParticipant;
  initialMessages: MessageView[];
}) {
  const [messages, setMessages] = useState<MessageView[]>(initialMessages);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length >= MESSAGE_PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const previousScrollHeight = useRef(0);

  // Reset local state whenever the selected conversation changes (admin
  // switching between clients in the list).
  useEffect(() => {
    setMessages(initialMessages);
    setHasMore(initialMessages.length >= MESSAGE_PAGE_SIZE);
    shouldAutoScroll.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Realtime: one subscription per conversation, torn down on unmount or
  // when the conversation changes — never left dangling or duplicated.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`direct_messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as { id: string; sender_id: string; body: string; created_at: string; read_at: string | null };
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                conversationId,
                senderId: row.sender_id,
                body: row.body,
                createdAt: row.created_at,
                readAt: row.read_at,
                isMine: row.sender_id === currentUserId,
              },
            ];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as { id: string; read_at: string | null };
          setMessages((prev) => prev.map((m) => (m.id === row.id ? { ...m, readAt: row.read_at } : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Mark the other participant's messages read whenever new ones arrive
  // while this conversation is open.
  useEffect(() => {
    const hasUnreadFromOther = messages.some((m) => !m.isMine && !m.readAt);
    if (hasUnreadFromOther) {
      markConversationRead(conversationId);
    }
  }, [messages, conversationId]);

  useEffect(() => {
    if (shouldAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore || messages.length === 0) return;
    setLoadingOlder(true);
    shouldAutoScroll.current = false;
    if (scrollRef.current) previousScrollHeight.current = scrollRef.current.scrollHeight;

    const supabase = createClient();
    const { data } = await supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .eq("conversation_id", conversationId)
      .lt("created_at", messages[0].createdAt)
      .order("created_at", { ascending: false })
      .limit(MESSAGE_PAGE_SIZE);

    const older = (data ?? [])
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

    setHasMore(older.length >= MESSAGE_PAGE_SIZE);
    setMessages((prev) => [...older, ...prev]);
    setLoadingOlder(false);
  }, [conversationId, currentUserId, hasMore, loadingOlder, messages]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 80) loadOlder();

    // Restore scroll position after prepending older messages so the view
    // doesn't jump.
    if (previousScrollHeight.current) {
      const delta = el.scrollHeight - previousScrollHeight.current;
      if (delta > 0) {
        el.scrollTop = el.scrollTop + delta;
        previousScrollHeight.current = 0;
      }
    }

    // Only auto-scroll to new messages if the reader is already near the
    // bottom — never yank them away from something they're reading.
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  async function handleSend(body: string): Promise<boolean> {
    shouldAutoScroll.current = true;
    const result = await sendMessage(conversationId, body);
    if (result.error || !result.message) {
      toast({ variant: "destructive", title: "Couldn't send message", description: result.error ?? "Please try again." });
      return false;
    }
    setMessages((prev) => (prev.some((m) => m.id === result.message!.id) ? prev : [...prev, result.message!]));
    return true;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConversationHeader participant={otherParticipant} />

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 space-y-1 overflow-y-auto p-4">
        {loadingOlder && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages.length === 0 ? (
          <StartConversationEmptyState personName={otherParticipant.name} />
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const showSeparator = !previous || !isSameCalendarDay(previous.createdAt, message.createdAt);
            return (
              <div key={message.id}>
                {showSeparator && <DateSeparator date={message.createdAt} />}
                <MessageBubble message={message} />
              </div>
            );
          })
        )}
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
}
