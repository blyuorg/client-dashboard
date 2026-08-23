"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProviderIcon } from "@/components/meetings/provider-icon";
import { formatInTimezone } from "@/lib/meetings/timezone";
import { PROVIDER_LABEL } from "@/lib/meetings/types";
import type { ScheduledMeeting } from "@/types/database";

export function MeetingSuccessDialog({
  meeting,
  onClose,
}: {
  meeting: ScheduledMeeting | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!meeting) return null;

  async function handleCopy() {
    if (!meeting?.meeting_url) return;
    await navigator.clipboard.writeText(meeting.meeting_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const calendarUrl = meeting.google_calendar_event_id
    ? `https://calendar.google.com/calendar/event?eid=${btoa(`${meeting.google_calendar_event_id} primary`).replace(/=+$/, "")}`
    : null;

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
          </div>
          <DialogTitle className="text-center">Meeting scheduled</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <ProviderIcon provider={meeting.provider} />
            <div className="min-w-0">
              <p className="truncate font-medium">{meeting.title}</p>
              <p className="text-xs text-muted-foreground">{PROVIDER_LABEL[meeting.provider]}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatInTimezone(meeting.start_time, meeting.timezone)} – {formatInTimezone(meeting.end_time, meeting.timezone)} (
            {meeting.timezone})
          </p>
          {meeting.meeting_url && (
            <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
              <p className="flex-1 truncate text-xs text-muted-foreground">{meeting.meeting_url}</p>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy} aria-label="Copy meeting link">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {meeting.meeting_url && (
            <Button asChild className="w-full">
              <a href={meeting.meeting_url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open meeting
              </a>
            </Button>
          )}
          {calendarUrl && (
            <Button variant="outline" asChild className="w-full">
              <a href={calendarUrl} target="_blank" rel="noreferrer">
                Open Google Calendar
              </a>
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
