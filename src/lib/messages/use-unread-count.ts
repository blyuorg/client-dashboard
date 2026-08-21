"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Live unread-message count for the sidebar badge. Realtime delivers
 * `direct_messages` change events only for rows the connection's RLS
 * grants SELECT on — a client's own conversation, or every conversation
 * for an admin — so no extra filter is needed here to scope it per role.
 */
export function useUnreadMessageCount(userId: string, initialCount: number) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const supabase = createClient();

    async function refresh() {
      const { count: fresh } = await supabase
        .from("direct_messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", userId);
      setCount(fresh ?? 0);
    }

    const channel = supabase
      .channel(`unread-count:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
