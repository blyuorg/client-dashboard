"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { updateGeneralProfile } from "@/lib/settings/actions";
import type { Profile } from "@/types/database";

export function GeneralSection({ profile }: { profile: Profile }) {
  const router = useRouter();
  const showToast = useSettingsToast();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [companyName, setCompanyName] = useState(profile.company_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);

  function reset() {
    setFullName(profile.full_name ?? "");
    setCompanyName(profile.company_name ?? "");
    setPhone(profile.phone ?? "");
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateGeneralProfile({
      full_name: fullName.trim() || null,
      company_name: companyName.trim() || null,
      phone: phone.trim() || null,
    });
    setSaving(false);

    if (error) {
      showToast("Couldn't save changes", error);
      return;
    }
    showToast("Changes saved");
    router.refresh();
  }

  return (
    <SettingsSection id="general" title="General" description="Your basic account and contact details.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>These details are used across your Blyu client portal.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Not provided" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Not provided" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={profile.email} disabled title="Email is tied to your login and can't be changed here" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Not provided" />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-border pt-6">
          <Button variant="ghost" onClick={reset} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </SettingsSection>
  );
}
