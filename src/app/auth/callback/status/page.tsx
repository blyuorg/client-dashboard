"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OAuthTransitionOverlay } from "@/components/auth/oauth-transition-overlay";
import { AuthBackground } from "@/components/auth/auth-background";

const SUCCESS_REDIRECT_DELAY_MS = 2000;
const ERROR_REDIRECT_DELAY_MS = 3000;

function CallbackStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, SUCCESS_REDIRECT_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // Any non-"success" value (including missing/malformed params) is treated
    // as a failed attempt — show the error state briefly then redirect to login
    // with an error param so the login page can show a friendly toast.
    const timer = setTimeout(() => {
      router.push("/login?error=google_auth_failed");
    }, ERROR_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  return (
    <>
      <AuthBackground />
      {status === "success" ? (
        <OAuthTransitionOverlay variant="success" />
      ) : (
        <OAuthTransitionOverlay
          variant="error"
          message="Unable to sign in with Google. Redirecting back to login…"
          onRetry={() => router.push("/login")}
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
