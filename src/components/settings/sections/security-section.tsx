"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, Laptop2, LogOut, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SettingsSection } from "@/components/settings/settings-section";
import { ActionCard } from "@/components/settings/action-card";
import { ChangePasswordDialog } from "@/components/settings/sections/change-password-dialog";
import { TwoFactorDialog } from "@/components/settings/sections/two-factor-dialog";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { signOutOtherSessions } from "@/lib/supabase/auth";
import type { Profile } from "@/types/database";

export function SecuritySection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);

  async function handleLogOutOthers() {
    setSigningOutOthers(true);
    const { error } = await signOutOtherSessions();
    setSigningOutOthers(false);
    showToast(error ? "Couldn't log out other devices" : "Logged out of other devices", error ?? undefined);
  }

  const CARDS = [
    {
      icon: KeyRound,
      title: "Change Password",
      description: "Update the password used to sign in to your account.",
      actionLabel: "Change Password",
      onAction: () => setPasswordOpen(true),
    },
    {
      icon: ShieldCheck,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account.",
      actionLabel: "Manage 2FA",
      onAction: () => setTwoFactorOpen(true),
    },
    {
      icon: Laptop2,
      title: "Active Sessions",
      description: "See details about your current sign-in.",
      actionLabel: "View Session",
      onAction: () => setSessionsOpen(true),
    },
    {
      icon: LogOut,
      title: "Log Out Other Devices",
      description: "Sign out of every session except this one.",
      actionLabel: signingOutOthers ? "Logging out…" : "Log Out Others",
      onAction: handleLogOutOthers,
    },
  ];

  return (
    <SettingsSection id="security" title="Security" description="Keep your account safe and in your control.">
      <Card>
        <CardContent className="space-y-3 p-4">
          {CARDS.map((card) => (
            <ActionCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              actionLabel={card.actionLabel}
              onAction={card.onAction}
            />
          ))}
        </CardContent>
      </Card>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <TwoFactorDialog open={twoFactorOpen} onOpenChange={setTwoFactorOpen} />

      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Active Session</DialogTitle>
            <DialogDescription>
              Supabase doesn&apos;t expose a per-device session list — here&apos;s what&apos;s known about your
              current sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Signed in as</span> {profile.email}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
