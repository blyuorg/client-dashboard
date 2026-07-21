"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NotificationFrequency } from "@/lib/notifications/types";

const OPTIONS: { key: NotificationFrequency; label: string; description: string }[] = [
  { key: "instant", label: "Instant", description: "Notify me as soon as something happens" },
  { key: "hourly", label: "Hourly Summary", description: "One digest every hour" },
  { key: "daily", label: "Daily Summary", description: "One digest per day" },
  { key: "weekly", label: "Weekly Summary", description: "One digest per week" },
];

export function NotificationFrequencyCard() {
  const [frequency, setFrequency] = useState<NotificationFrequency>("instant");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Frequency</CardTitle>
        <CardDescription>Control how often updates are delivered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const active = frequency === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setFrequency(option.key)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  active ? "border-primary/50 bg-primary/10" : "border-border hover:bg-secondary/40"
                )}
              >
                <p className={cn("text-sm", active ? "font-semibold text-primary" : "font-medium")}>{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
