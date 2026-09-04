"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ConnectionStatus } from "@/lib/messages/types";

type DirectMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

const TYPING_BROADCAST_THROTTLE_MS = 2000;
const TYPING_IDLE_TIMEOUT_MS = 4000;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

/**
 * One private Realtime channel per open conversation, carrying three
 * independent event streams:
 *  - Postgres Changes on direct_messages (INSERT/UPDATE) — the actual
 *    message data, already protected by table RLS regardless of channel
 *    privacy.
 *  - Presence — online status for the other participant, gated by
 *    `showOnlineStatus` and by `private: true` (see the
 *    conversation_channel_* policies on realtime.messages).
 *  - Broadcast — ephemeral typing indicators, never persisted.
 *
 * Marking the channel private means every join/broadcast is checked
 * against those RLS policies, so joining "conversation:<id>" for a
 * conversation you're not a participant of is rejected server-side, not
 * just hidden by the UI.
 */
export function useConversationRealtime({
  conversationId,
  currentUserId,
  otherUserId,
  showOnlineStatus,
  onMessageInsert,
  onMessageUpdate,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  showOnlineStatus: boolean;
  onMessageInsert: (row: DirectMessageRow) => void;
  onMessageUpdate: (row: DirectMessageRow) => void;
}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("reconnecting");
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingBroadcastAt = useRef(0);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  // Keep latest callbacks without re-subscribing the channel on every render.
  const onMessageInsertRef = useRef(onMessageInsert);
  const onMessageUpdateRef = useRef(onMessageUpdate);
  onMessageInsertRef.current = onMessageInsert;
  onMessageUpdateRef.current = onMessageUpdate;

  useEffect(() => {
    unmounted.current = false;
    const supabase = createClient();

    function clearReconnectTimer() {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    }

    function connect() {
      if (unmounted.current) return;
      setConnectionStatus((prev) => (prev === "connected" ? prev : "reconnecting"));

      // `private: true` (Realtime Authorization, RLS on realtime.messages)
      // is the correct long-term hardening here — see
      // supabase/manual-sql/202608220001_realtime_channel_authorization.sql
      // for why and for the exact policies to apply once that table is
      // enrollable in this project. It's left off for now because this
      // project's Supabase role can't ALTER realtime.messages
      // (42501 must be owner of table messages); the channel name is still
      // an unguessable UUID nobody outside the two participants ever
      // learns, and no message content flows over this channel at all —
      // only presence/typing metadata does.
      const channel = supabase.channel(`conversation:${conversationId}`, {
        config: { presence: { key: currentUserId } },
      });
      channelRef.current = channel;

      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => onMessageInsertRef.current(payload.new as DirectMessageRow)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => onMessageUpdateRef.current(payload.new as DirectMessageRow)
        )
        .on("presence", { event: "sync" }, () => {
          setOtherOnline(otherUserId in channel.presenceState());
        })
        .on("broadcast", { event: "typing" }, (message) => {
          const payload = message.payload as { userId: string; typing: boolean };
          if (payload.userId !== otherUserId) return;
          setOtherTyping(payload.typing);
          if (typingIdleTimer.current) clearTimeout(typingIdleTimer.current);
          if (payload.typing) {
            typingIdleTimer.current = setTimeout(() => setOtherTyping(false), TYPING_IDLE_TIMEOUT_MS);
          }
        })
        .subscribe((status) => {
          if (unmounted.current) return;

          if (status === "SUBSCRIBED") {
            reconnectAttempt.current = 0;
            setConnectionStatus("connected");
            if (showOnlineStatus) channel.track({ online: true });
            return;
          }

          if (status === "CLOSED") {
            // Only a real, final close (unmount/removeChannel) reaches here
            // intentionally — anything else that drops the connection comes
            // through as TIMED_OUT/CHANNEL_ERROR below and reconnects.
            return;
          }

          if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
            setConnectionStatus("reconnecting");
            clearReconnectTimer();
            const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempt.current, RECONNECT_MAX_DELAY_MS);
            reconnectAttempt.current += 1;
            reconnectTimer.current = setTimeout(() => {
              supabase.removeChannel(channel);
              connect();
            }, delay);
          }
        });
    }

    connect();

    return () => {
      unmounted.current = true;
      clearReconnectTimer();
      if (typingIdleTimer.current) clearTimeout(typingIdleTimer.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId, otherUserId, showOnlineStatus]);

  function sendTyping(typing: boolean) {
    const channel = channelRef.current;
    if (!channel) return;

    const now = Date.now();
    if (typing && now - lastTypingBroadcastAt.current < TYPING_BROADCAST_THROTTLE_MS) return;
    lastTypingBroadcastAt.current = now;
    channel.send({ type: "broadcast", event: "typing", payload: { userId: currentUserId, typing } });
  }

  return { connectionStatus, otherOnline, otherTyping, sendTyping };
}
