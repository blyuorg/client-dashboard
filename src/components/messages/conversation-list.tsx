import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/messages/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  return (
    <ul className="divide-y divide-border overflow-y-auto">
      {conversations.map((conversation) => {
        const active = conversation.id === selectedId;
        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                active && "bg-secondary"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                {conversation.client.avatarUrl && (
                  <AvatarImage src={conversation.client.avatarUrl} alt={conversation.client.name} />
                )}
                <AvatarFallback>{initials(conversation.client.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm", conversation.unreadCount > 0 ? "font-semibold" : "font-medium")}>
                    {conversation.client.name}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRelativeTime(conversation.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {conversation.lastMessage
                      ? `${conversation.lastMessage.isMine ? "You: " : ""}${conversation.lastMessage.body}`
                      : "No messages yet"}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge className="shrink-0 px-1.5 py-0 text-[10px]">{conversation.unreadCount}</Badge>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
