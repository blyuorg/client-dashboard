"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsUserOnline } from "@/lib/presence/presence-provider";
import { cn } from "@/lib/utils";
import type { ConversationParticipant } from "@/lib/messages/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ConversationHeader({ participant }: { participant: ConversationParticipant }) {
  const online = useIsUserOnline(participant.id);

  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt={participant.name} />}
          <AvatarFallback>{initials(participant.name)}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
            online ? "bg-success" : "bg-muted-foreground/40"
          )}
          aria-label={online ? "Online" : "Offline"}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{participant.name}</p>
        <p className="text-xs capitalize text-muted-foreground">
          {participant.role === "admin" ? "Project Manager" : "Client"} · {online ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
}
