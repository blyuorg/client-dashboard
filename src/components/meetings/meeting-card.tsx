"use client";

import { CalendarClock, Users, Pencil, Ban, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProviderIcon } from "@/components/meetings/provider-icon";
import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import { formatInTimezone } from "@/lib/meetings/timezone";
import { computeDisplayStatus } from "@/lib/meetings/status";
import type { MeetingWithAttendees } from "@/lib/meetings/queries";
import { PROVIDER_LABEL } from "@/lib/meetings/types";

export function MeetingCard({
  meeting,
  onEdit,
  onCancel,
}: {
  meeting: MeetingWithAttendees;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const status = computeDisplayStatus(meeting);
  const editable = status !== "cancelled" && status !== "completed";
  const joinable = status !== "cancelled" && status !== "completed" && Boolean(meeting.meeting_url);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ProviderIcon provider={meeting.provider} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{meeting.title}</p>
              <MeetingStatusBadge status={status} />
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {formatInTimezone(meeting.start_time, meeting.timezone)}
              </span>
              <span>{PROVIDER_LABEL[meeting.provider]}</span>
              {meeting.attendees.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {meeting.attendees.length}
                </span>
              )}
            </p>
            {meeting.sync_error && <p className="mt-1 text-xs text-destructive">{meeting.sync_error}</p>}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {joinable && (
            <Button size="sm" asChild>
              <a href={meeting.meeting_url!} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Join
              </a>
            </Button>
          )}
          {editable && (
            <>
              <Button size="sm" variant="outline" onClick={onEdit} aria-label="Edit meeting">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={onCancel} aria-label="Cancel meeting">
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
