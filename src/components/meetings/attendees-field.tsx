"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type AttendeeDraft = { name: string; email: string };

export function AttendeesField({
  attendees,
  onChange,
}: {
  attendees: AttendeeDraft[];
  onChange: (attendees: AttendeeDraft[]) => void;
}) {
  function updateAttendee(index: number, patch: Partial<AttendeeDraft>) {
    onChange(attendees.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function removeAttendee(index: number) {
    onChange(attendees.filter((_, i) => i !== index));
  }

  function addAttendee() {
    onChange([...attendees, { name: "", email: "" }]);
  }

  return (
    <div className="space-y-2">
      {attendees.map((attendee, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            aria-label="Attendee name"
            placeholder="Name"
            value={attendee.name}
            onChange={(e) => updateAttendee(index, { name: e.target.value })}
            className="w-1/3"
          />
          <Input
            aria-label="Attendee email"
            type="email"
            placeholder="Email address"
            value={attendee.email}
            onChange={(e) => updateAttendee(index, { email: e.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeAttendee(index)}
            aria-label="Remove attendee"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addAttendee}>
        <Plus className="mr-2 h-3.5 w-3.5" />
        Add attendee
      </Button>
    </div>
  );
}
