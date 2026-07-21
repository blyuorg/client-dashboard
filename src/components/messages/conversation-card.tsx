"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/messages/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConversationCard({
  conversation,
  selected,
  onSelect,
}: {
  conversation: ConversationSummary;
  selected?: boolean;
  onSelect: (conversation: ConversationSummary) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:bg-secondary/50",
        selected && "border-primary/40 bg-primary/10"
      )}
    >
      <span className="relative shrink-0">
        <Avatar>
          <AvatarFallback>{initials(conversation.managerName)}</AvatarFallback>
        </Avatar>
        {conversation.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{conversation.projectName}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{conversation.managerName}</p>
        <p className="truncate text-xs text-muted-foreground/80">{conversation.lastMessagePreview}</p>
      </div>

      {conversation.unreadCount > 0 && (
        <Badge className="shrink-0 rounded-full px-1.5">{conversation.unreadCount}</Badge>
      )}
    </button>
  );
}
