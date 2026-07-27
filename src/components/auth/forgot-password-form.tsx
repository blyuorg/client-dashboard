"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { FloatingInput } from "@/components/auth/floating-input";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setServerError(null);
    const { error } = await sendPasswordResetEmail(
      values.email,
      `${window.location.origin}/reset-password`
    );

    if (error) {
      setServerError(error);
      return;
    }
    setSent(true);
    toast({ variant: "success", title: "Reset link sent", description: "Check your inbox to continue." });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center py-2 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-auth-success/10"
        >
          <CheckCircle2 className="h-7 w-7 text-auth-success" />
        </motion.div>
        <h3 className="mt-4 text-lg font-semibold text-auth-text">Check your email</h3>
        <p className="mt-1.5 max-w-xs text-sm text-auth-muted">
          We&apos;ve sent a password reset link to your inbox. Click it to choose a new password.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm font-medium text-auth-primary hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-auth-primary/10">
          <Mail className="h-7 w-7 text-auth-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-auth-text">Forgot password?</h3>
        <p className="mt-1.5 max-w-xs text-sm text-auth-muted">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <FloatingInput
          id="forgot-email"
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-auth-danger">
            {serverError}
          </p>
        )}

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
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-auth-muted hover:text-auth-text hover:underline"
        >
          Back to login
        </button>
      </form>
    </div>
  );
}
