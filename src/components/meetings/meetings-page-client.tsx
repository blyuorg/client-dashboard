"use client";

import { useState } from "react";
import { CalendarPlus, CalendarX2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScheduleMeetingDialog } from "@/components/meetings/schedule-meeting-dialog";
import { MeetingSuccessDialog } from "@/components/meetings/meeting-success-dialog";
import { MeetingCard } from "@/components/meetings/meeting-card";
import { cancelMeetingAction } from "@/lib/meetings/actions";
import { toast } from "@/hooks/use-toast";
import type { MeetingWithAttendees } from "@/lib/meetings/queries";
import type { OAuthProvider, ScheduledMeeting } from "@/types/database";

export function MeetingsPageClient({
  initialMeetings,
  connectedProviders,
}: {
  initialMeetings: MeetingWithAttendees[];
  connectedProviders: OAuthProvider[];
}) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingWithAttendees | null>(null);
  const [successMeeting, setSuccessMeeting] = useState<ScheduledMeeting | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MeetingWithAttendees | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const connectedSet = new Set(connectedProviders);
  const visibleMeetings = meetings.filter((m) => m.status !== "cancelled");

  function handleScheduled(meeting: ScheduledMeeting) {
    setMeetings((prev) => {
      const withoutMeeting = prev.filter((m) => m.id !== meeting.id);
      const attendees = prev.find((m) => m.id === meeting.id)?.attendees ?? [];
      return [...withoutMeeting, { ...meeting, attendees }].sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });
    setScheduleOpen(false);
    setEditingMeeting(null);
    setSuccessMeeting(meeting);
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    const { error } = await cancelMeetingAction(cancelTarget.id);
    setCancelling(false);

    if (error) {
      toast({ variant: "destructive", title: "Couldn't cancel meeting", description: error });
      return;
    }
    setMeetings((prev) => prev.map((m) => (m.id === cancelTarget.id ? { ...m, status: "cancelled" } : m)));
    setCancelTarget(null);
    toast({ title: "Meeting cancelled" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Meetings</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage meetings across Google Meet, Zoom, and Teams.</p>
        </div>
        <Button onClick={() => setScheduleOpen(true)} className="w-fit">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Schedule meeting
        </Button>
      </div>

      {visibleMeetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <CalendarX2 className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-medium">No meetings scheduled</h3>
            <p className="max-w-sm text-sm text-muted-foreground">Schedule your first meeting to see it here.</p>
          </div>
          <Button onClick={() => setScheduleOpen(true)} variant="outline" className="mt-2">
            Schedule meeting
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={() => setEditingMeeting(meeting)}
              onCancel={() => setCancelTarget(meeting)}
            />
          ))}
        </div>
      )}

      <ScheduleMeetingDialog
        open={scheduleOpen || Boolean(editingMeeting)}
        onOpenChange={(open) => {
          if (!open) {
            setScheduleOpen(false);
            setEditingMeeting(null);
          }
        }}
        connectedProviders={connectedSet}
        editingMeeting={editingMeeting}
        onScheduled={handleScheduled}
      />

      <MeetingSuccessDialog meeting={successMeeting} onClose={() => setSuccessMeeting(null)} />

      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel meeting?</DialogTitle>
            <DialogDescription>
              This cancels &quot;{cancelTarget?.title}&quot; on {cancelTarget ? new Date(cancelTarget.start_time).toLocaleDateString() : ""} and
              removes it from your calendar. Attendees will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep meeting
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={cancelling}>
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
