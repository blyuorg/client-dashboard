"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MESSAGE_MAX_LENGTH } from "@/lib/messages/types";
import { cn } from "@/lib/utils";

export function MessageComposer({
  disabled,
  onSend,
  onTypingChange,
}: {
  disabled?: boolean;
  onSend: (body: string) => void;
  onTypingChange?: (typing: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();

  function handleSend() {
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    onTypingChange?.(false);
    textareaRef.current?.focus();
  }

  function handleChange(next: string) {
    setValue(next.slice(0, MESSAGE_MAX_LENGTH));
    onTypingChange?.(next.trim().length > 0);
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
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onTypingChange?.(false)}
        disabled={disabled}
        placeholder={disabled ? "Messaging is unavailable" : "Type a message…"}
        rows={1}
        className={cn(
          "max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <Button size="icon" onClick={handleSend} disabled={disabled || !trimmed} aria-label="Send message">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
