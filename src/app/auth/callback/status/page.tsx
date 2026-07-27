"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OAuthTransitionOverlay } from "@/components/auth/oauth-transition-overlay";
import { AuthBackground } from "@/components/auth/auth-background";
import { signInWithGoogle } from "@/lib/supabase/auth";

const REDIRECT_DELAY_MS = 2000;

function CallbackStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  return (
    <>
      <AuthBackground />
      {status === "success" ? (
        <OAuthTransitionOverlay variant="success" />
      ) : (
        // Any non-"success" value (including a missing/malformed param from
        // a direct visit to this URL) is treated as a failed attempt — same
        // signInWithGoogle() call the login page's Google button uses,
        // unchanged.
        <OAuthTransitionOverlay
          variant="error"
          onRetry={() => signInWithGoogle()}
          onBackToLogin={() => router.push("/login")}
        />
      )}
    </>
  );
}

export default function AuthCallbackStatusPage() {
  return (
    <Suspense
      fallback={
        <>
          <AuthBackground />
          <OAuthTransitionOverlay variant="connecting" />
        </>
      }
    >
      <CallbackStatus />
    </Suspense>
  );
}
