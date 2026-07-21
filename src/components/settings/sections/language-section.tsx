"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { SelectField } from "@/components/settings/select-field";

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

export function LanguageSection() {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0]);
  const [timeFormat, setTimeFormat] = useState(TIME_FORMATS[0]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);

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
      </Card>
    </SettingsSection>
  );
}
