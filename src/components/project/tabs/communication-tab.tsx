import { CalendarClock, MessageCircle } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Message, Meeting } from "@/types/database";

type Entry =
  | { kind: "message"; at: string; data: Message }
  | { kind: "meeting"; at: string; data: Meeting };

export function CommunicationTab({ messages, meetings }: { messages: Message[]; meetings: Meeting[] }) {
  const entries: Entry[] = [
    ...messages.map((m): Entry => ({ kind: "message", at: m.created_at, data: m })),
    ...meetings.map((m): Entry => ({ kind: "meeting", at: m.scheduled_at, data: m })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages or meetings for this project yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={`${entry.kind}-${entry.data.id}`}
          className="flex gap-3 rounded-lg border border-border p-3"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            {entry.kind === "message" ? (
              <MessageCircle className="h-3.5 w-3.5" />
            ) : (
              <CalendarClock className="h-3.5 w-3.5" />
            )}
          </span>
          <div className="min-w-0">
            {entry.kind === "message" ? (
              <p className="text-sm">{entry.data.body}</p>
            ) : (
              <>
                <p className="text-sm font-medium">{entry.data.title}</p>
                {entry.data.notes && <p className="text-xs text-muted-foreground">{entry.data.notes}</p>}
              </>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {entry.kind === "meeting" ? `Scheduled for ${formatDate(entry.at)}` : formatRelativeTime(entry.at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
