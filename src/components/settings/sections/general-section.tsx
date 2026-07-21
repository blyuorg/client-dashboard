"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";

const FIELDS = [
  { id: "full_name", label: "Full Name" },
  { id: "company_name", label: "Company Name" },
  { id: "email", label: "Email Address" },
  { id: "phone", label: "Phone Number" },
];

export function GeneralSection() {
  const showToast = useSettingsToast();

  return (
    <SettingsSection id="general" title="General" description="Your basic account and contact details.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>These details are used across your Blyu client portal.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input id={field.id} placeholder="Not provided" disabled />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-border pt-6">
          <Button variant="ghost">Cancel</Button>
          <Button
            onClick={() => showToast("Changes saved", "This is a UI preview — no data was actually changed.")}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </SettingsSection>
  );
}
