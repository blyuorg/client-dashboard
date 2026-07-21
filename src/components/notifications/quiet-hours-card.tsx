"use client";

import { useState } from "react";
import { MoonStar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, h) => {
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return { value: String(h), label: `${hour12}:00 ${suffix}` };
});

const TIMEZONES = [
  "Asia/Kolkata (IST)",
  "Asia/Dubai (GST)",
  "Europe/London (GMT)",
  "America/New_York (EST)",
  "America/Los_Angeles (PST)",
  "Australia/Sydney (AEST)",
];

const selectClasses = cn(
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
);

export function QuietHoursCard() {
  const [dnd, setDnd] = useState(false);
  const [start, setStart] = useState("22");
  const [end, setEnd] = useState("7");
  const [timezone, setTimezone] = useState(TIMEZONES[0]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
            <MoonStar className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">Quiet Hours</CardTitle>
            <CardDescription>Pause non-urgent alerts during set hours</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Do Not Disturb</span>
          <Switch checked={dnd} onCheckedChange={setDnd} aria-label="Do Not Disturb" />
        </div>
      </CardHeader>
      <CardContent className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3", !dnd && "opacity-60")}>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Start Time</label>
          <select
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={!dnd}
            className={selectClasses}
          >
            {HOURS.map((hour) => (
              <option key={hour.value} value={hour.value}>
                {hour.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">End Time</label>
          <select value={end} onChange={(e) => setEnd(e.target.value)} disabled={!dnd} className={selectClasses}>
            {HOURS.map((hour) => (
              <option key={hour.value} value={hour.value}>
                {hour.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={!dnd}
            className={selectClasses}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
