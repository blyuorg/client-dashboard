"use client";

import { GoogleIcon } from "@/components/icons/google-icon";
import { GitHubIcon } from "@/components/icons/github-icon";
import { useRipple } from "@/hooks/use-ripple";
import { RippleLayer } from "@/components/auth/ripple-layer";
import { cn } from "@/lib/utils";

export function SocialAuthButtons({
  mode,
  googleLoading,
  onGoogleClick,
  disabled,
}: {
  mode: "signin" | "signup";
  googleLoading: boolean;
  onGoogleClick: () => void;
  disabled?: boolean;
}) {
  const google = useRipple();
  const copy = mode === "signin" ? "Continue with Google" : "Sign up with Google";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onGoogleClick}
        onMouseDown={google.addRipple}
        disabled={googleLoading || disabled}
        aria-label={googleLoading ? "Signing in with Google…" : copy}
        className={cn(
          "relative flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-auth-border bg-white text-sm font-medium text-auth-text",
          "transition-all duration-200 hover:border-auth-muted/60 hover:shadow-md active:scale-[0.99]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <RippleLayer ripples={google.ripples} />
        {googleLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-auth-border border-t-auth-primary" />
            Signing in…
          </>
        ) : (
          <>
            <GoogleIcon className="h-[18px] w-[18px]" />
            {copy}
          </>
        )}
      </button>

      {/* GitHub OAuth isn't configured in Supabase yet — shown as a
          placeholder per the design spec rather than wired to a
          non-existent provider, so it never fails silently. */}
      <button
        type="button"
        disabled
        aria-label="GitHub sign-in coming soon"
        title="Coming soon"
        className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-auth-border bg-white text-sm font-medium text-auth-muted opacity-60"
      >
        <GitHubIcon className="h-[18px] w-[18px]" />
        Continue with GitHub
      </button>
    </div>
  );
}
