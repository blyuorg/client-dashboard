"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquareText,
  Phone,
  Smartphone,
  Monitor,
  FolderKanban,
  Milestone,
  Receipt,
  FileText,
  MessageSquare,
  CalendarClock,
  Megaphone,
  LifeBuoy,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { PillGroup } from "@/components/settings/pill-group";

type ToggleItem = { key: string; label: string; icon: LucideIcon; defaultOn: boolean };

const CHANNELS: ToggleItem[] = [
  { key: "email", label: "Email", icon: Mail, defaultOn: true },
  { key: "sms", label: "SMS", icon: MessageSquareText, defaultOn: false },
  { key: "whatsapp", label: "WhatsApp", icon: Phone, defaultOn: false },
  { key: "push", label: "Push Notifications", icon: Smartphone, defaultOn: true },
  { key: "desktop", label: "Desktop Notifications", icon: Monitor, defaultOn: false },
];

const TYPES: ToggleItem[] = [
  { key: "project_updates", label: "Project Updates", icon: FolderKanban, defaultOn: true },
  { key: "milestones", label: "Project Milestones", icon: Milestone, defaultOn: true },
  { key: "billing", label: "Billing & Invoices", icon: Receipt, defaultOn: true },
  { key: "documents", label: "Documents", icon: FileText, defaultOn: true },
  { key: "messages", label: "Messages", icon: MessageSquare, defaultOn: true },
  { key: "meetings", label: "Meeting Reminders", icon: CalendarClock, defaultOn: true },
  { key: "announcements", label: "Announcements", icon: Megaphone, defaultOn: false },
  { key: "support", label: "Support Tickets", icon: LifeBuoy, defaultOn: true },
  { key: "security", label: "Security Alerts", icon: ShieldAlert, defaultOn: true },
];

function useToggles(items: ToggleItem[]) {
  return useState<Record<string, boolean>>(() => Object.fromEntries(items.map((i) => [i.key, i.defaultOn])));
}

export function NotificationsSection() {
  const [channelState, setChannelState] = useToggles(CHANNELS);
  const [typeState, setTypeState] = useToggles(TYPES);
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("instant");

  return (
    <SettingsSection id="notifications" title="Notifications" description="Choose how and when Blyu keeps you updated.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
          <CardDescription>Where you&apos;d like to receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {CHANNELS.map((item) => (
            <SettingToggleRow
              key={item.key}
              icon={item.icon}
              label={item.label}
              checked={channelState[item.key]}
              onCheckedChange={(checked) => setChannelState((prev) => ({ ...prev, [item.key]: checked }))}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Types</CardTitle>
          <CardDescription>What kind of updates should notify you</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {TYPES.map((item) => (
            <SettingToggleRow
              key={item.key}
              icon={item.icon}
              label={item.label}
              checked={typeState[item.key]}
              onCheckedChange={(checked) => setTypeState((prev) => ({ ...prev, [item.key]: checked }))}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Frequency</CardTitle>
          <CardDescription>How often digests should be delivered</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={frequency}
            onChange={setFrequency}
            options={[
              { value: "instant", label: "Instant" },
              { value: "daily", label: "Daily Summary" },
              { value: "weekly", label: "Weekly Summary" },
            ]}
          />
        </CardContent>
      </Card>
    </SettingsSection>
  );
}
