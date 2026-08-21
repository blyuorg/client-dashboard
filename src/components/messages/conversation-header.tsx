import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ConnectionStatus, ConversationParticipant } from "@/lib/messages/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  connected: "Connected",
  reconnecting: "Reconnecting…",
  offline: "Offline",
};

export function ConversationHeader({
  participant,
  online,
  typing,
  connectionStatus,
}: {
  participant: ConversationParticipant;
  online: boolean;
  typing: boolean;
  connectionStatus: ConnectionStatus;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
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
          <p className="truncate text-xs text-muted-foreground">
            {typing ? (
              <span className="text-primary">{participant.name.split(" ")[0]} is typing…</span>
            ) : (
              <>
                {participant.role === "admin" ? "Project Manager" : "Client"} · {online ? "Online" : "Offline"}
              </>
            )}
          </p>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
        title={CONNECTION_LABEL[connectionStatus]}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connectionStatus === "connected" && "bg-success",
            connectionStatus === "reconnecting" && "animate-pulse bg-warning",
            connectionStatus === "offline" && "bg-muted-foreground/40"
          )}
        />
        <span className="hidden sm:inline">{CONNECTION_LABEL[connectionStatus]}</span>
      </div>
    </div>
  );
}
