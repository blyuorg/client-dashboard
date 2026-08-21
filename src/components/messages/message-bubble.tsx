import { Check, CheckCheck, Loader2, RotateCw } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { MessageView } from "@/lib/messages/types";

export function MessageBubble({ message, onRetry }: { message: MessageView; onRetry?: (message: MessageView) => void }) {
  const failed = message.status === "failed";
  const sending = message.status === "sending";

  return (
    <div className={cn("flex", message.isMine ? "justify-end" : "justify-start")}>
      <div className="flex max-w-[75%] flex-col items-end gap-1">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            message.isMine
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-secondary text-secondary-foreground",
            failed && "opacity-60",
            sending && "opacity-70"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-[10px]",
              message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {sending ? (
              <>
                <span>Sending</span>
                <Loader2 className="h-3 w-3 animate-spin" />
              </>
            ) : (
              <>
                <span>{formatTime(message.createdAt)}</span>
                {message.isMine &&
                  !failed &&
                  (message.readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
              </>
            )}
          </div>
        </div>
        {failed && (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline"
          >
            <RotateCw className="h-3 w-3" />
            Failed to send · Retry
          </button>
        )}
      </div>
    </div>
  );
}
