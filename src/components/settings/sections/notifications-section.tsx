"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { PillGroup } from "@/components/settings/pill-group";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { NotificationFrequency, NotificationsPreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

export function NotificationsSection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.notifications as NotificationsPreferences | undefined;

  const [frequency, setFrequency] = useState<NotificationFrequency>(saved?.frequency ?? "instant");
  const [saving, setSaving] = useState(false);

  async function handleChange(next: NotificationFrequency) {
    setFrequency(next);
    setSaving(true);
    const { error } = await savePreferences("notifications", { frequency: next });
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Notification preferences saved", error ?? undefined);
  }

  return (
    <SettingsSection id="notifications" title="Notifications" description="Choose how often Blyu keeps you updated.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Frequency</CardTitle>
          <CardDescription>How often you&apos;d like to hear from us</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={frequency}
            onChange={handleChange}
            options={[
              { value: "instant", label: "Immediately" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "never", label: "Never" },
            ]}
          />
        </CardContent>
        {saving && (
          <CardFooter className="justify-end border-t border-border pt-4">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </span>
          </CardFooter>
        )}
      </Card>
    </SettingsSection>
  );
}
