"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";
import { cn } from "@/lib/utils";

type OAuthTransitionOverlayProps =
  | { variant: "connecting" }
  | { variant: "success" }
  | { variant: "error"; message?: string; onRetry: () => void; onBackToLogin: () => void };

/**
 * Full-screen state shown between "user clicked Continue with Google" and
 * the browser actually leaving for accounts.google.com, and again on the
 * way back — driven by /auth/callback/status. Purely presentational: no
 * auth calls happen in here.
 */
export function OAuthTransitionOverlay(props: OAuthTransitionOverlayProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-auth-bg/90 px-4 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={props.variant}
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-sm rounded-auth border border-auth-border bg-auth-card p-10 text-center shadow-[0_8px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          {props.variant === "connecting" && <ConnectingState />}
          {props.variant === "success" && <SuccessState />}
          {props.variant === "error" && <ErrorState {...props} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ConnectingState() {
  return (
    <div role="status" aria-live="polite">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-auth-primary/25 blur-2xl" />
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-auth-border border-t-auth-primary"
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white">
          <GoogleIcon className="h-7 w-7" />
        </div>
      </div>

      <h2 className="mt-6 text-lg font-semibold text-auth-text">Connecting your Google Account</h2>
      <p className="mt-2 text-sm leading-relaxed text-auth-muted">
        Please wait while we securely authenticate your account.
      </p>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-auth-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div role="status" aria-live="polite">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="relative mx-auto flex h-20 w-20 items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-auth-success/20 blur-2xl" />
        <CheckCircle2 className="relative h-16 w-16 text-auth-success" strokeWidth={1.5} />
      </motion.div>

      <h2 className="mt-6 text-lg font-semibold text-auth-text">Authentication Successful</h2>
      <p className="mt-2 text-sm leading-relaxed text-auth-muted">Redirecting to your dashboard…</p>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full animate-progress-fill rounded-full bg-gradient-to-r from-auth-primary to-auth-success" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  onBackToLogin,
}: {
  message?: string;
  onRetry: () => void;
  onBackToLogin: () => void;
}) {
  return (
    <div role="alert">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="relative mx-auto flex h-20 w-20 items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-auth-danger/20 blur-2xl" />
        <XCircle className="relative h-16 w-16 text-auth-danger" strokeWidth={1.5} />
      </motion.div>

      <h2 className="mt-6 text-lg font-semibold text-auth-text">Authentication Failed</h2>
      <p className="mt-2 text-sm leading-relaxed text-auth-muted">
        {message ?? "Please try again."}
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-xl bg-auth-primary text-sm font-medium text-white transition-all",
            "hover:bg-auth-primary-hover active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2 focus-visible:ring-offset-auth-bg"
          )}
        >
          Retry
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-xl border border-auth-border text-sm font-medium text-auth-text transition-all",
            "hover:bg-auth-cardHover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2 focus-visible:ring-offset-auth-bg"
          )}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
