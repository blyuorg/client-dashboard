"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { PillGroup } from "@/components/settings/pill-group";
import { SelectField } from "@/components/settings/select-field";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { MeetingsPreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

const WORKING_HOURS = ["9:00 AM – 5:00 PM", "10:00 AM – 6:00 PM", "8:00 AM – 4:00 PM", "Flexible"];
const TIMEZONES = ["Asia/Kolkata (IST)", "Europe/London (GMT)", "America/New_York (EST)", "America/Los_Angeles (PST)"];
const REMINDERS = ["15 minutes before", "30 minutes before", "1 hour before", "1 day before"];

export function MeetingsSection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.meetings as MeetingsPreferences | undefined;

  const [platform, setPlatform] = useState<"google_meet" | "zoom" | "teams">(saved?.platform ?? "google_meet");
  const [workingHours, setWorkingHours] = useState(saved?.workingHours ?? WORKING_HOURS[0]);
  const [timezone, setTimezone] = useState(saved?.timezone ?? TIMEZONES[0]);
  const [reminder, setReminder] = useState(saved?.reminder ?? REMINDERS[1]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await savePreferences("meetings", { platform, workingHours, timezone, reminder });
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Meeting preferences saved", error ?? undefined);
  }

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
