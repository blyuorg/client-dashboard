import { FilePlus2, Send, MailOpen, CircleCheck, FileCheck2, History, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/billing/empty-state";
import { formatDate } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/dashboard/billing-types";

const ICONS: Record<string, LucideIcon> = {
  "Invoice Created": FilePlus2,
  "Invoice Sent": Send,
  "Client Viewed": MailOpen,
  "Payment Received": CircleCheck,
  "Receipt Generated": FileCheck2,
};

export function PaymentTimeline({ events = [] }: { events?: TimelineEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Timeline</CardTitle>
        <CardDescription>Latest invoice activity</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Timeline events will appear here once invoices start moving."
          />
        ) : (
          <ul className="space-y-5">
            {events.map((event, i) => {
              const Icon = ICONS[event.label] ?? CircleCheck;
              return (
                <li key={event.id} className="relative flex gap-3 pl-1">
                  {i !== events.length - 1 && (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border" />
                  )}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-1 items-start justify-between gap-2 pt-1">
                    <div>
                      <p className="text-sm font-medium">{event.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)} · {event.time}
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0">
                      Done
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
