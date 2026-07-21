"use client";

import { motion } from "framer-motion";
import { CheckCheck } from "lucide-react";
import { NotificationPriorityBadge } from "@/components/notifications/notification-priority-badge";
import { CATEGORY_META } from "@/components/notifications/category-meta";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { NotificationItem } from "@/lib/notifications/types";

export function NotificationCard({
  notification,
  selected,
  onSelect,
}: {
  notification: NotificationItem;
  selected?: boolean;
  onSelect: (notification: NotificationItem) => void;
}) {
  const Icon = CATEGORY_META[notification.category].icon;
  const unread = notification.status === "unread";

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2 }}
      onClick={() => onSelect(notification)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
        selected ? "border-primary/40 bg-primary/10" : "border-transparent hover:bg-secondary/50",
        unread && !selected && "bg-secondary/20"
      )}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>{notification.title}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.description}</p>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-xs text-muted-foreground">{notification.projectName}</span>
          <NotificationPriorityBadge priority={notification.priority} />
        </div>
      </div>

      <span className="mt-1.5 shrink-0">
        {unread ? (
          <span className="block h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
        ) : (
          <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" aria-label="Read" />
        )}
      </span>
    </motion.button>
  );
}
