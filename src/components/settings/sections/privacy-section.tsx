"use client";

import { useState } from "react";
import { Circle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { PrivacyPreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

export function PrivacySection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.privacy as PrivacyPreferences | undefined;
  const [showOnlineStatus, setShowOnlineStatus] = useState(saved?.showOnlineStatus ?? true);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: boolean) {
    setShowOnlineStatus(next);
    setSaving(true);
    const { error } = await savePreferences("privacy", { showOnlineStatus: next });
    setSaving(false);
    if (error) setShowOnlineStatus(!next);
    showToast(error ? "Couldn't save changes" : "Privacy preferences saved", error ?? undefined);
  }

  return (
    <SettingsSection id="privacy" title="Privacy" description="Control what others can see about you.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Show Online Status</CardTitle>
          <CardDescription>Let your assigned team member see when you&apos;re online</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggleRow
            icon={Circle}
            label="Show Online Status"
            description={showOnlineStatus ? "You appear online to others" : "You appear offline to everyone"}
            checked={showOnlineStatus}
            onCheckedChange={handleChange}
          />
          {saving && (
            <p className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </p>
          )}
        </CardContent>
      </Card>
    </SettingsSection>
  );
}
