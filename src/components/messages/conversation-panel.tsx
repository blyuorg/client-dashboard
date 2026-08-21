"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/lib/messages/actions";
import { useConversationRealtime } from "@/lib/messages/use-conversation-realtime";
import { MESSAGE_PAGE_SIZE } from "@/lib/messages/types";
import type { ConversationParticipant, MessageView } from "@/lib/messages/types";
import { ConversationHeader } from "@/components/messages/conversation-header";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";
import { DateSeparator, isSameCalendarDay } from "@/components/messages/date-separator";
import { StartConversationEmptyState } from "@/components/messages/empty-states";
import { toast } from "@/hooks/use-toast";

type DirectMessageRow = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; read_at: string | null };

function toMessageView(row: DirectMessageRow, currentUserId: string): MessageView {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
    isMine: row.sender_id === currentUserId,
  };
}

export function ConversationPanel({
  conversationId,
  currentUserId,
  otherParticipant,
  initialMessages,
  showOnlineStatus,
}: {
  conversationId: string;
  currentUserId: string;
  otherParticipant: ConversationParticipant;
  initialMessages: MessageView[];
  showOnlineStatus: boolean;
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

  const handleInsert = useCallback(
    (row: DirectMessageRow) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        // Reconcile against our own optimistic "sending" bubble instead of
        // appending a duplicate, in case this event wins the race against
        // sendMessage's own response.
        if (row.sender_id === currentUserId) {
          const optimisticIndex = prev.findIndex((m) => m.status === "sending" && m.senderId === currentUserId && m.body === row.body);
          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = toMessageView(row, currentUserId);
            return next;
          }
        }
        return [...prev, toMessageView(row, currentUserId)];
      });
    },
    [currentUserId]
  );

  const handleUpdate = useCallback((row: DirectMessageRow) => {
    setMessages((prev) => prev.map((m) => (m.id === row.id ? { ...m, readAt: row.read_at } : m)));
  }, []);

  const { connectionStatus, otherOnline, otherTyping, sendTyping } = useConversationRealtime({
    conversationId,
    currentUserId,
    otherUserId: otherParticipant.id,
    showOnlineStatus,
    onMessageInsert: handleInsert,
    onMessageUpdate: handleUpdate,
  });

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
    const oldestLoaded = messages.find((m) => m.status !== "sending")?.createdAt ?? messages[0].createdAt;
    const { data } = await supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .eq("conversation_id", conversationId)
      .lt("created_at", oldestLoaded)
      .order("created_at", { ascending: false })
      .limit(MESSAGE_PAGE_SIZE);

    const older = (data ?? []).map((row) => toMessageView(row, currentUserId)).reverse();

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

  async function handleSend(body: string, retryClientId?: string) {
    shouldAutoScroll.current = true;
    const clientId = retryClientId ?? crypto.randomUUID();
    const optimistic: MessageView = {
      id: clientId,
      conversationId,
      senderId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
      status: "sending",
      clientId,
    };

    setMessages((prev) => (retryClientId ? prev.map((m) => (m.clientId === retryClientId ? optimistic : m)) : [...prev, optimistic]));

    const result = await sendMessage(conversationId, body);

    if (result.error || !result.message) {
      setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: "failed" } : m)));
      toast({ variant: "destructive", title: "Couldn't send message", description: result.error ?? "Please try again." });
      return;
    }

    const confirmed = result.message;
    setMessages((prev) => {
      // Realtime may have already reconciled this optimistic bubble (see
      // handleInsert) — if so there's nothing left to replace by clientId,
      // and appending here would duplicate it.
      if (prev.some((m) => m.clientId === clientId)) {
        return prev.map((m) => (m.clientId === clientId ? { ...confirmed, status: "sent" } : m));
      }
      if (prev.some((m) => m.id === confirmed.id)) return prev;
      return [...prev, { ...confirmed, status: "sent" }];
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConversationHeader
        participant={otherParticipant}
        online={otherOnline}
        typing={otherTyping}
        connectionStatus={connectionStatus}
      />

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
                <MessageBubble
                  message={message}
                  onRetry={(m) => handleSend(m.body, m.clientId)}
                />
              </div>
            );
          })
        )}
      </div>

      <MessageComposer onSend={(body) => handleSend(body)} onTypingChange={sendTyping} />
    </div>
  );
}
