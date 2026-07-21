"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { PillGroup } from "@/components/settings/pill-group";
import { SelectField } from "@/components/settings/select-field";

const WORKING_HOURS = ["9:00 AM – 5:00 PM", "10:00 AM – 6:00 PM", "8:00 AM – 4:00 PM", "Flexible"];
const TIMEZONES = ["Asia/Kolkata (IST)", "Europe/London (GMT)", "America/New_York (EST)", "America/Los_Angeles (PST)"];
const REMINDERS = ["15 minutes before", "30 minutes before", "1 hour before", "1 day before"];

export function MeetingsSection() {
  const [platform, setPlatform] = useState<"google_meet" | "zoom" | "teams">("google_meet");
  const [workingHours, setWorkingHours] = useState(WORKING_HOURS[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [reminder, setReminder] = useState(REMINDERS[1]);

  return (
    <SettingsSection id="meetings" title="Meeting Preferences" description="Set how you'd like to meet with the Blyu team.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferred Meeting Platform</CardTitle>
          <CardDescription>Used when scheduling calls with your project manager</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={platform}
            onChange={setPlatform}
            options={[
              { value: "google_meet", label: "Google Meet" },
              { value: "zoom", label: "Zoom" },
              { value: "teams", label: "Microsoft Teams" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferred Meeting Time</CardTitle>
          <CardDescription>Your usual availability window</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Working Hours" value={workingHours} onChange={setWorkingHours} options={WORKING_HOURS} />
          <SelectField label="Time Zone" value={timezone} onChange={setTimezone} options={TIMEZONES} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting Reminder Preference</CardTitle>
          <CardDescription>When you&apos;d like to be reminded before a meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectField label="Remind Me" value={reminder} onChange={setReminder} options={REMINDERS} />
        </CardContent>
      </Card>
    </SettingsSection>
  );
}
