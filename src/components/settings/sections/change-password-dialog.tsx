"use client";

import { useState } from "react";
import { Loader2, Mail, Phone, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";

type Method = "email" | "phone";

export function ChangePasswordDialog({
  open,
  onOpenChange,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}) {
  const [method, setMethod] = useState<Method>("email");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMethod("email");
    setSending(false);
    setSent(false);
    setError(null);
  }

  async function handleSendEmail() {
    setSending(true);
    setError(null);
    const { error: sendError } = await sendPasswordResetEmail(email, `${window.location.origin}/reset-password`);
    setSending(false);
    if (sendError) return setError(sendError);
    setSent(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Choose how you&apos;d like to verify it&apos;s you.</DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                We sent a secure reset link to {email}. Open it to choose a new password.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors ${
                  method === "email" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors ${
                  method === "phone" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                }`}
              >
                <Phone className="h-4 w-4" />
                Phone
              </button>
            </div>

            {method === "email" ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send a secure reset link to your registered email, <span className="font-medium text-foreground">{email}</span>.
                </p>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button onClick={handleSendEmail} disabled={sending} className="w-full">
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                Phone-based password recovery isn&apos;t available yet — this account isn&apos;t set up for
                phone verification. Use email instead.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
