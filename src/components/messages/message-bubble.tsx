import { Check, CheckCheck } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { MessageView } from "@/lib/messages/types";

export function MessageBubble({ message }: { message: MessageView }) {
  return (
    <div className={cn("flex", message.isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          message.isMine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-secondary text-secondary-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {message.isMine && (message.readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
        </div>
      </div>
    </div>
  );
}
