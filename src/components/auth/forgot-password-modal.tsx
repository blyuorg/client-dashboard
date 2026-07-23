"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export function ForgotPasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-auth border-auth-border bg-white p-8">
        <DialogTitle className="sr-only">Reset your password</DialogTitle>
        <ForgotPasswordForm onBack={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
