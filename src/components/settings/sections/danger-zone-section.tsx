"use client";

import { useState } from "react";
import { AlertTriangle, Download, LogOut, Trash2, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { useSettingsToast } from "@/components/settings/settings-toast-provider";

type DangerAction = {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  confirmDescription: string;
};

const ACTIONS: DangerAction[] = [
  {
    key: "export",
    icon: Download,
    title: "Export My Data",
    description: "Download a copy of everything Blyu holds about your account.",
    actionLabel: "Export Data",
    confirmDescription: "We'll prepare a downloadable export of your account data.",
  },
  {
    key: "logout",
    icon: LogOut,
    title: "Log Out",
    description: "Sign out of the Blyu client portal on this device.",
    actionLabel: "Log Out",
    confirmDescription: "You'll be signed out of the Blyu client portal on this device.",
  },
  {
    key: "delete",
    icon: Trash2,
    title: "Delete Account",
    description: "Permanently remove your account and all associated data.",
    actionLabel: "Delete Account",
    confirmDescription: "This will permanently delete your account. This action cannot be undone.",
  },
];

export function DangerZoneSection() {
  const [openAction, setOpenAction] = useState<DangerAction | null>(null);
  const showToast = useSettingsToast();

  function handleConfirm() {
    if (!openAction) return;
    setOpenAction(null);
    showToast("This is a UI preview", `${openAction.title} isn't connected to a backend yet.`);
  }

  return (
    <SettingsSection id="danger" title="Danger Zone" description="Irreversible and destructive actions.">
      <Card className="border-destructive/30 bg-destructive/[0.03]">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base text-destructive">Proceed with caution</CardTitle>
            <CardDescription>These actions may be permanent and cannot always be undone.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ACTIONS.map((action) => (
            <div
              key={action.key}
              className="flex flex-col gap-4 rounded-xl border border-destructive/20 p-4 transition-colors hover:border-destructive/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <action.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" className="shrink-0" onClick={() => setOpenAction(action)}>
                {action.actionLabel}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!openAction} onOpenChange={(open) => !open && setOpenAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm: {openAction?.title}</DialogTitle>
            <DialogDescription>{openAction?.confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenAction(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Yes, {openAction?.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
