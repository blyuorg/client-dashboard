"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2, MailCheck } from "lucide-react";
import { AuthCard, AuthCardHeader } from "@/components/auth/auth-card";
import { FloatingInput } from "@/components/auth/floating-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Checkbox } from "@/components/ui/checkbox";
import { RippleLayer } from "@/components/auth/ripple-layer";
import { useRipple } from "@/hooks/use-ripple";
import { signUp, signInWithGoogle } from "@/lib/supabase/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const submitRipple = useRipple();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
  });

  async function onSubmit(values: RegisterInput) {
    // The public.profiles row is created server-side by the handle_new_user
    // trigger (supabase/schema.sql), not here. Inserting it client-side would
    // race against email confirmation: until the user confirms, signUp()
    // returns no session, so auth.uid() is NULL and RLS rejects the insert.
    const { data, error } = await signUp(values.email, values.password, {
      full_name: values.fullName,
    });

    if (error) {
      toast({ variant: "destructive", title: "Registration failed", description: error });
      return;
    }

    if (!data?.session) {
      // Email confirmation is required — there's no session to redirect with.
      setConfirmationSent(true);
      return;
    }

    toast({ variant: "success", title: "Welcome to Blyu", description: "Your account is ready." });
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast({ variant: "destructive", title: "Google sign-up failed", description: error });
      setIsGoogleLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-2 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-auth-success/10"
          >
            <MailCheck className="h-7 w-7 text-auth-success" />
          </motion.div>
          <h3 className="mt-4 text-lg font-semibold text-auth-text">Check your inbox</h3>
          <p className="mt-1.5 max-w-xs text-sm text-auth-muted">
            We&apos;ve sent a confirmation link to your email address. Click it to activate your
            account, then sign in.
          </p>
          <Link href="/login" className="mt-6 text-sm font-medium text-auth-primary hover:underline">
            Back to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  const password = watch("password");

  return (
    <AuthCard>
      <AuthCardHeader title="Create Your Account" subtitle="Get started with your Blyu client portal." />

      <SocialAuthButtons
        mode="signup"
        googleLoading={isGoogleLoading}
        onGoogleClick={handleGoogleSignIn}
        disabled={isSubmitting}
      />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-auth-border" />
        <span className="text-xs font-medium tracking-wide text-auth-muted">OR CONTINUE WITH</span>
        <div className="h-px flex-1 bg-auth-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FloatingInput
          id="fullName"
          label="Full Name"
          icon={User}
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FloatingInput
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <FloatingInput
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="px-1 pt-2">
            <PasswordStrengthMeter password={password ?? ""} />
          </div>
        </div>
        <FloatingInput
          id="confirmPassword"
          label="Confirm Password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-auth-text">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={!!errors.terms}
                  className="mt-0.5"
                />
                I agree to the Terms &amp; Privacy Policy
              </label>
              {errors.terms && (
                <p role="alert" className="text-xs text-auth-danger">
                  {errors.terms.message}
                </p>
              )}
            </div>
          )}
        />

        <button
          type="submit"
          onMouseDown={submitRipple.addRipple}
          disabled={isSubmitting || isGoogleLoading}
          className={cn(
            "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-auth-primary text-sm font-medium text-white transition-all",
            "hover:bg-auth-primary-hover active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          <RippleLayer ripples={submitRipple.ripples} />
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-auth-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-auth-primary hover:underline">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}
