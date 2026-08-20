"use client";

import { useState } from "react";
import {
  Circle,
  Users,
  Phone,
  Mail,
  MessageSquareText,
  Megaphone,
  BarChart3,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { PrivacyPreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

type ToggleItem = { key: string; label: string; icon: LucideIcon; defaultOn: boolean };

const ITEMS: ToggleItem[] = [
  { key: "online_status", label: "Show Online Status", icon: Circle, defaultOn: true },
  { key: "team_contact", label: "Allow Project Team Contact", icon: Users, defaultOn: true },
  { key: "whatsapp", label: "Allow WhatsApp Communication", icon: Phone, defaultOn: false },
  { key: "email", label: "Allow Email Communication", icon: Mail, defaultOn: true },
  { key: "sms", label: "Allow SMS Communication", icon: MessageSquareText, defaultOn: false },
  { key: "product_updates", label: "Receive Product Updates", icon: Megaphone, defaultOn: true },
  { key: "analytics", label: "Share Anonymous Analytics", icon: BarChart3, defaultOn: true },
];

export function PrivacySection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.privacy as PrivacyPreferences | undefined;
  const [state, setState] = useState<Record<string, boolean>>(
    saved ?? Object.fromEntries(ITEMS.map((i) => [i.key, i.defaultOn]))
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await savePreferences("privacy", state);
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Privacy preferences saved", error ?? undefined);
  }

  return (
    <SettingsSection id="privacy" title="Privacy" description="Control what others can see and how you can be reached.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy Controls</CardTitle>
          <CardDescription>Manage visibility and communication preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {ITEMS.map((item) => (
            <SettingToggleRow
              key={item.key}
              icon={item.icon}
              label={item.label}
              checked={state[item.key]}
              onCheckedChange={(checked) => setState((prev) => ({ ...prev, [item.key]: checked }))}
            />
          ))}
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
