"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "@/components/settings/settings-section";
import { ChangePasswordDialog } from "@/components/settings/sections/change-password-dialog";
import { TwoFactorDialog } from "@/components/settings/sections/two-factor-dialog";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import type { Profile } from "@/types/database";

export function SecuritySection({ profile }: { profile: Profile }) {
  const router = useRouter();
  const showToast = useSettingsToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data }) => {
      setTwoFactorEnabled(Boolean(data?.totp.some((f) => f.status === "verified")));
    });
  }, []);

  async function handleLogOut() {
    setSigningOut(true);
    const { error } = await signOut();
    setSigningOut(false);
    if (error) {
      showToast("Couldn't log out", error);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <SettingsSection id="security" title="Security" description="Keep your account safe and in your control.">
      <Card>
        <CardContent className="divide-y divide-border p-0">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <KeyRound className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Change your password</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => setPasswordOpen(true)}>
              Change Password
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  {twoFactorEnabled ? "Enabled — an authenticator code is required to sign in" : "Add an additional layer of security"}
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={() => setTwoFactorOpen(true)}
              aria-label="Two-factor authentication"
            />
          </div>

          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <LogOut className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Log Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={handleLogOut} disabled={signingOut}>
              {signingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} email={profile.email} />
      <TwoFactorDialog open={twoFactorOpen} onOpenChange={setTwoFactorOpen} onStatusChange={setTwoFactorEnabled} />
    </SettingsSection>
  );
}
