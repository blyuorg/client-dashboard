"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { AuthCard, AuthCardHeader } from "@/components/auth/auth-card";
import { FloatingInput } from "@/components/auth/floating-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { updatePassword } from "@/lib/supabase/auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [updated, setUpdated] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordInput) {
    const { error } = await updatePassword(values.password);

    if (error) {
      toast({ variant: "destructive", title: "Couldn't update password", description: error });
      return;
    }

    toast({ variant: "success", title: "Password updated" });
    setUpdated(true);
  }

  if (updated) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-2 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-auth-success/10"
          >
            <CheckCircle2 className="h-7 w-7 text-auth-success" />
          </motion.div>
          <h3 className="mt-4 text-lg font-semibold text-auth-text">Password Updated Successfully</h3>
          <p className="mt-1.5 max-w-xs text-sm text-auth-muted">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-auth-primary text-sm font-medium text-white transition-all hover:bg-auth-primary-hover"
          >
            Continue to Login
          </button>
        </div>
      </AuthCard>
    );
  }

  const password = watch("password");

  return (
    <AuthCard>
      <AuthCardHeader title="Set a New Password" subtitle="Choose a strong password for your account." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <FloatingInput
            id="password"
            label="New Password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="px-1 pt-2">
            <PasswordStrengthMeter password={password ?? ""} showChecklist />
          </div>
        </div>
        <FloatingInput
          id="confirmPassword"
          label="Confirm New Password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-auth-primary text-sm font-medium text-white transition-all",
            "hover:bg-auth-primary-hover active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2 focus-visible:ring-offset-auth-bg",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </AuthCard>
  );
}
