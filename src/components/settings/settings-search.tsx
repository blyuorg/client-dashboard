"use client";

import { useState } from "react";
import { Search, X, History } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SettingsSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder="Search settings..."
        className="rounded-full pl-9 pr-9"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          /
        </kbd>
      )}

      {focused && !value && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-xl border border-border bg-popover p-3 shadow-lg">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Recent Searches
          </p>
          <p className="text-xs text-muted-foreground/70">No recent searches yet.</p>
        </div>
      )}
    </div>
  );
}
