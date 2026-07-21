"use client";

import { useState } from "react";
import { MessageSquareText, Phone, Mail, Smartphone, Bell, Monitor, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { NotificationChannel } from "@/lib/notifications/types";

const CHANNELS: { key: NotificationChannel; label: string; description: string; icon: LucideIcon; defaultOn: boolean }[] = [
  { key: "sms", label: "SMS", description: "Text messages to your phone number", icon: MessageSquareText, defaultOn: false },
  { key: "whatsapp", label: "WhatsApp", description: "Updates via WhatsApp Business", icon: Phone, defaultOn: false },
  { key: "email", label: "Email", description: "Notifications sent to your inbox", icon: Mail, defaultOn: true },
  { key: "push", label: "Push Notifications", description: "Mobile app push alerts", icon: Smartphone, defaultOn: true },
  { key: "inApp", label: "In-App Notifications", description: "Shown inside the client portal", icon: Bell, defaultOn: true },
  { key: "desktop", label: "Desktop Notifications", description: "Browser notifications on this device", icon: Monitor, defaultOn: false },
];

export function NotificationPreferencesCard() {
  const [state, setState] = useState<Record<NotificationChannel, boolean>>(() =>
    Object.fromEntries(CHANNELS.map((c) => [c.key, c.defaultOn])) as Record<NotificationChannel, boolean>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
        <CardDescription>Choose how you&apos;d like to receive updates from Blyu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {CHANNELS.map((channel) => (
          <div key={channel.key} className="flex items-center justify-between gap-4 rounded-lg px-2 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <channel.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{channel.label}</p>
                <p className="truncate text-xs text-muted-foreground">{channel.description}</p>
              </div>
            </div>
            <Switch
              checked={state[channel.key]}
              onCheckedChange={(checked) => setState((prev) => ({ ...prev, [channel.key]: checked }))}
              aria-label={channel.label}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
