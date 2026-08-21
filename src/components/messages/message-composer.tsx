"use client";

import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MESSAGE_MAX_LENGTH } from "@/lib/messages/types";
import { cn } from "@/lib/utils";

export function MessageComposer({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (body: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const isDisabled = Boolean(disabled) || sending;

  async function handleSend() {
    if (!trimmed || isDisabled) return;
    setSending(true);
    const ok = await onSend(trimmed);
    setSending(false);
    if (ok) {
      setValue("");
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border bg-background p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder={disabled ? "Messaging is unavailable" : "Type a message…"}
        rows={1}
        className={cn(
          "max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <Button size="icon" onClick={handleSend} disabled={isDisabled || !trimmed} aria-label="Send message">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
}
