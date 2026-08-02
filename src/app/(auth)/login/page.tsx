"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import { AuthCard, AuthCardHeader } from "@/components/auth/auth-card";
import { FloatingInput } from "@/components/auth/floating-input";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { OAuthTransitionOverlay } from "@/components/auth/oauth-transition-overlay";
import { Checkbox } from "@/components/ui/checkbox";
import { RippleLayer } from "@/components/auth/ripple-layer";
import { useRipple } from "@/hooks/use-ripple";
import { signIn, signInWithGoogle } from "@/lib/supabase/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type OAuthUiState = "idle" | "connecting" | "error";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oauthState, setOauthState] = useState<OAuthUiState>("idle");
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const signInRipple = useRipple();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Show a friendly error when redirected back from a failed OAuth callback.
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_auth_failed") {
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: "Unable to sign in with Google. Please try again.",
      });
      // Clean the URL so refreshing doesn't re-show the toast.
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

  async function onSubmit(values: LoginInput) {
    const { error } = await signIn(values.email, values.password);

    if (error) {
      toast({ variant: "destructive", title: "Sign in failed", description: error });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    // Shows the "Connecting your Google Account" transition immediately
    // instead of the browser jumping straight to a blank navigation — the
    // actual signInWithOAuth() call and its redirect behavior are unchanged.
    setOauthState("connecting");
    const { error } = await signInWithGoogle();

    // On success the browser is already navigating to Google, so there's
    // nothing left to do here — only an error leaves us on this page.
    if (error) {
      toast({ variant: "destructive", title: "Google sign-in failed", description: error });
      setOauthState("error");
    }
  }

  return (
    <>
      {oauthState === "connecting" && <OAuthTransitionOverlay variant="connecting" />}
      {oauthState === "error" && (
        <OAuthTransitionOverlay
          variant="error"
          onRetry={handleGoogleSignIn}
          onBackToLogin={() => setOauthState("idle")}
        />
      )}

      <AuthCard>
        <AuthCardHeader title="Welcome Back" subtitle="Sign in to continue to your dashboard." />

      <SocialAuthButtons
        mode="signin"
        googleLoading={oauthState === "connecting"}
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
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FloatingInput
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-auth-text">
            <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} aria-label="Remember me" />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-sm font-medium text-auth-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          onMouseDown={signInRipple.addRipple}
          disabled={isSubmitting || oauthState === "connecting"}
          className={cn(
            "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-auth-primary text-sm font-medium text-white transition-all",
            "hover:bg-auth-primary-hover active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2 focus-visible:ring-offset-auth-bg",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          <RippleLayer ripples={signInRipple.ripples} />
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-auth-muted">
          <ShieldCheck className="h-3.5 w-3.5" />
          Protected with enterprise-grade encryption.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-auth-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-auth-primary hover:underline">
          Create Account
        </Link>
      </p>

      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
      </AuthCard>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
