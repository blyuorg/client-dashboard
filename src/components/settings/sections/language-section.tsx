"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { SelectField } from "@/components/settings/select-field";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { LanguagePreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Arabic"];
const TIMEZONES = [
  "Asia/Kolkata (IST)",
  "Asia/Dubai (GST)",
  "Europe/London (GMT)",
  "America/New_York (EST)",
  "America/Los_Angeles (PST)",
  "Australia/Sydney (AEST)",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12-hour", "24-hour"];
const CURRENCIES = ["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)", "AED (د.إ)"];

export function LanguageSection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.language as LanguagePreferences | undefined;

  const [language, setLanguage] = useState(saved?.language ?? LANGUAGES[0]);
  const [timezone, setTimezone] = useState(saved?.timezone ?? TIMEZONES[0]);
  const [dateFormat, setDateFormat] = useState(saved?.dateFormat ?? DATE_FORMATS[0]);
  const [timeFormat, setTimeFormat] = useState(saved?.timeFormat ?? TIME_FORMATS[0]);
  const [currency, setCurrency] = useState(saved?.currency ?? CURRENCIES[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await savePreferences("language", { language, timezone, dateFormat, timeFormat, currency });
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Regional preferences saved", error ?? undefined);
  }

  return (
    <SettingsSection id="language" title="Language & Region" description="Set your language, timezone, and regional formats.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regional Preferences</CardTitle>
          <CardDescription>These affect how dates, times, and currency are displayed</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <SelectField label="Time Zone" value={timezone} onChange={setTimezone} options={TIMEZONES} />
          <SelectField label="Date Format" value={dateFormat} onChange={setDateFormat} options={DATE_FORMATS} />
          <SelectField label="Time Format" value={timeFormat} onChange={setTimeFormat} options={TIME_FORMATS} />
          <SelectField label="Currency Display" value={currency} onChange={setCurrency} options={CURRENCIES} />
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
