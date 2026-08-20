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
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { PillGroup } from "@/components/settings/pill-group";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { NotificationsPreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

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

function defaults(items: ToggleItem[]): Record<string, boolean> {
  return Object.fromEntries(items.map((i) => [i.key, i.defaultOn]));
}

export function NotificationsSection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.notifications as NotificationsPreferences | undefined;

  const [channelState, setChannelState] = useState<Record<string, boolean>>(saved?.channels ?? defaults(CHANNELS));
  const [typeState, setTypeState] = useState<Record<string, boolean>>(saved?.types ?? defaults(TYPES));
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">(saved?.frequency ?? "instant");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await savePreferences("notifications", {
      channels: channelState,
      types: typeState,
      frequency,
    });
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Notification preferences saved", error ?? undefined);
  }

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
        <CardFooter className="justify-end border-t border-border pt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </SettingsSection>
  );
}
