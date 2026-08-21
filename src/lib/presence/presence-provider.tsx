"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const OnlineUsersContext = createContext<Set<string>>(new Set());

/** Set of user ids currently tracked as online on the shared presence channel. */
export function useOnlineUsers() {
  return useContext(OnlineUsersContext);
}

export function useIsUserOnline(userId: string | null | undefined) {
  const online = useOnlineUsers();
  return userId ? online.has(userId) : false;
}

const PRESENCE_TOGGLE_EVENT = "blyu:presence-toggle";

/** Settings → Privacy → Show Online Status calls this to take effect immediately, without a reload. */
export function setPresenceEnabled(enabled: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(PRESENCE_TOGGLE_EVENT, { detail: enabled }));
}

/**
 * Tracks this user's presence on one shared channel for the whole app, and
 * exposes who else is currently online via context. Joining/leaving is
 * gated on the user's Show Online Status preference — when it's off, this
 * user simply never calls `.track()`, so they're absent from every other
 * client's presence state (indistinguishable from actually being offline).
 */
export function PresenceProvider({
  userId,
  initialEnabled,
  children,
}: {
  userId: string;
  initialEnabled: boolean;
  children: React.ReactNode;
}) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [enabled, setEnabled] = useState(initialEnabled);

  useEffect(() => {
    function handleToggle(event: Event) {
      setEnabled((event as CustomEvent<boolean>).detail);
    }
    window.addEventListener(PRESENCE_TOGGLE_EVENT, handleToggle);
    return () => window.removeEventListener(PRESENCE_TOGGLE_EVENT, handleToggle);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("presence:online", { config: { presence: { key: userId } } });

    channel
      .on("presence", { event: "sync" }, () => {
        setOnlineUsers(new Set(Object.keys(channel.presenceState())));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && enabled) {
          await channel.track({ online: true, since: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enabled]);

  return <OnlineUsersContext.Provider value={onlineUsers}>{children}</OnlineUsersContext.Provider>;
}
