"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AttendeesField, type AttendeeDraft } from "@/components/meetings/attendees-field";
import { ProviderSelector } from "@/components/meetings/provider-selector";
import { createMeetingAction, updateMeetingAction } from "@/lib/meetings/actions";
import { zonedWallTimeToUtcIso } from "@/lib/meetings/timezone";
import { TIMEZONE_OPTIONS, guessLocalTimezone } from "@/lib/meetings/types";
import type { MeetingProviderKind, OAuthProvider, ScheduledMeeting, ScheduledMeetingAttendee } from "@/types/database";
import type { ZoomOptions } from "@/lib/integrations/provider";

const DEFAULT_ZOOM_OPTIONS: ZoomOptions = { waitingRoom: true, joinBeforeHost: false, hostVideo: true, participantVideo: true };

function toDateInput(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(
    new Date(iso)
  );
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function toTimeInput(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(
    new Date(iso)
  );
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")}`;
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  connectedProviders,
  editingMeeting,
  onScheduled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedProviders: Set<OAuthProvider>;
  editingMeeting?: (ScheduledMeeting & { attendees: ScheduledMeetingAttendee[] }) | null;
  onScheduled: (meeting: ScheduledMeeting) => void;
}) {
  const isEditing = Boolean(editingMeeting);
  const defaultTimezone = editingMeeting?.timezone ?? guessLocalTimezone();

  const [title, setTitle] = useState(editingMeeting?.title ?? "");
  const [description, setDescription] = useState(editingMeeting?.description ?? "");
  const [date, setDate] = useState(editingMeeting ? toDateInput(editingMeeting.start_time, defaultTimezone) : "");
  const [startTime, setStartTime] = useState(editingMeeting ? toTimeInput(editingMeeting.start_time, defaultTimezone) : "");
  const [endTime, setEndTime] = useState(editingMeeting ? toTimeInput(editingMeeting.end_time, defaultTimezone) : "");
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [attendees, setAttendees] = useState<AttendeeDraft[]>(
    editingMeeting?.attendees.map((a) => ({ name: a.name ?? "", email: a.email })) ?? []
  );
  const [provider, setProvider] = useState<MeetingProviderKind>(editingMeeting?.provider ?? "google_meet");
  const [zoomOptions, setZoomOptions] = useState<ZoomOptions>(DEFAULT_ZOOM_OPTIONS);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setTimezone(guessLocalTimezone());
    setAttendees([]);
    setProvider("google_meet");
    setZoomOptions(DEFAULT_ZOOM_OPTIONS);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !date || !startTime || !endTime) {
      setError("Fill in the meeting title, date, and time.");
      return;
    }

    const cleanAttendees = attendees.filter((a) => a.email.trim());
    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: "",
      provider,
      startTime: zonedWallTimeToUtcIso(date, startTime, timezone),
      endTime: zonedWallTimeToUtcIso(date, endTime, timezone),
      timezone,
      attendees: cleanAttendees,
      zoomOptions: provider === "zoom" ? zoomOptions : undefined,
      idempotencyKey,
    };

    setSubmitting(true);
    const result = isEditing
      ? await updateMeetingAction({ ...payload, meetingId: editingMeeting!.id })
      : await createMeetingAction(payload);
    setSubmitting(false);

    if (result.error || !result.meeting) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    onScheduled(result.meeting);
    if (!isEditing) reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isEditing) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit meeting" : "Schedule a meeting"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details — attendees are notified of the change." : "Creates the meeting and adds it to your Google Calendar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-title">Title</Label>
              <Input id="meeting-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-description">Description</Label>
              <textarea
                id="meeting-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <Label htmlFor="meeting-date">Date</Label>
              <Input id="meeting-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-start">Start time</Label>
              <Input id="meeting-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-end">End time</Label>
              <Input id="meeting-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="meeting-timezone">Timezone</Label>
              <select
                id="meeting-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Attendees</Label>
            <AttendeesField attendees={attendees} onChange={setAttendees} />
          </div>

          <div className="space-y-1.5">
            <Label>Meeting platform</Label>
            <ProviderSelector
              value={provider}
              onChange={setProvider}
              connectedProviders={connectedProviders}
              zoomOptions={zoomOptions}
              onZoomOptionsChange={setZoomOptions}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Schedule meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
