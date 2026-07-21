"use client";

import { useState } from "react";
import {
  FolderKanban,
  Receipt,
  CreditCard,
  CalendarClock,
  FileText,
  LifeBuoy,
  Megaphone,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { PriorityNotificationKey } from "@/lib/notifications/types";

const ITEMS: { key: PriorityNotificationKey; label: string; icon: LucideIcon; defaultOn: boolean }[] = [
  { key: "project", label: "Project Updates", icon: FolderKanban, defaultOn: true },
  { key: "invoices", label: "Invoices", icon: Receipt, defaultOn: true },
  { key: "payments", label: "Payments", icon: CreditCard, defaultOn: true },
  { key: "meetings", label: "Meetings", icon: CalendarClock, defaultOn: true },
  { key: "documents", label: "Documents", icon: FileText, defaultOn: true },
  { key: "support", label: "Support", icon: LifeBuoy, defaultOn: true },
  { key: "announcements", label: "Announcements", icon: Megaphone, defaultOn: false },
  { key: "security", label: "Security Alerts", icon: ShieldAlert, defaultOn: true },
];

export function PriorityNotificationsCard() {
  const [state, setState] = useState<Record<PriorityNotificationKey, boolean>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.key, i.defaultOn])) as Record<PriorityNotificationKey, boolean>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Priority Notifications</CardTitle>
        <CardDescription>Choose which updates should always notify you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg px-2 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <p className="truncate text-sm font-medium">{item.label}</p>
              </div>
              <Switch
                checked={state[item.key]}
                onCheckedChange={(checked) => setState((prev) => ({ ...prev, [item.key]: checked }))}
                aria-label={item.label}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
