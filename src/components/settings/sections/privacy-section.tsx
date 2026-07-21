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
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";

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

export function PrivacySection() {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.key, i.defaultOn]))
  );

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
      </Card>
    </SettingsSection>
  );
}
