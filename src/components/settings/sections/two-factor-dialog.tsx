"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getReadableErrorMessage } from "@/lib/supabase/errors";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";

type EnrollState = { factorId: string; qrCode: string; secret: string } | null;

export function TwoFactorDialog({
  open,
  onOpenChange,
  onStatusChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (enabled: boolean) => void;
}) {
  const showToast = useSettingsToast();
  const [loading, setLoading] = useState(true);
  const [enabledFactorId, setEnabledFactorId] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<EnrollState>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setEnrolling(null);
    setCode("");
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data, error: listError }) => {
      setLoading(false);
      if (listError) return setError(getReadableErrorMessage(listError));
      const verified = data?.totp.find((f) => f.status === "verified");
      setEnabledFactorId(verified?.id ?? null);
      onStatusChange?.(Boolean(verified));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startEnroll() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);

    if (enrollError || !data) return setError(getReadableErrorMessage(enrollError));
    setEnrolling({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verifyEnroll() {
    if (!enrolling) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrolling.factorId,
      code: code.trim(),
    });
    setBusy(false);

    if (verifyError) return setError(getReadableErrorMessage(verifyError));
    setEnabledFactorId(enrolling.factorId);
    setEnrolling(null);
    setCode("");
    showToast("Two-factor authentication enabled");
    onStatusChange?.(true);
  }

  async function disable() {
    if (!enabledFactorId) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: enabledFactorId });
    setBusy(false);

    if (unenrollError) return setError(getReadableErrorMessage(unenrollError));
    setEnabledFactorId(null);
    showToast("Two-factor authentication disabled");
    onStatusChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>Require an authenticator app code in addition to your password.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : enabledFactorId && !enrolling ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm">Two-factor authentication is currently enabled.</p>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="destructive" onClick={disable} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable 2FA
              </Button>
            </DialogFooter>
          </div>
        ) : enrolling ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enrolling.qrCode} alt="Scan with your authenticator app" className="h-40 w-40 rounded-lg border border-border bg-white p-2" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Can&apos;t scan? Enter this code manually: <span className="font-mono">{enrolling.secret}</span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="totp-code">6-digit code</Label>
              <Input
                id="totp-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button onClick={verifyEnroll} disabled={busy || code.trim().length !== 6}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up an authenticator app (Google Authenticator, 1Password, Authy) to generate login codes.
            </p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button onClick={startEnroll} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set up 2FA
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
