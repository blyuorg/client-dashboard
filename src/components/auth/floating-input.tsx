"use client";

import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "placeholder"> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
}

/**
 * Floating label is pure CSS (no state): `placeholder=" "` keeps the native
 * `:placeholder-shown` pseudo-class accurate for an uncontrolled input, which
 * is exactly what react-hook-form's `register()` ref gives us — no re-render
 * wiring needed to keep the label in sync with the DOM value.
 */
export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ id, label, icon: Icon, error, type = "text", className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        <div className="relative">
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-auth-muted" />

          <input
            ref={ref}
            id={id}
            type={resolvedType}
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={cn(
              "peer h-14 w-full rounded-xl border bg-auth-card pl-10 pt-4 text-sm text-auth-text outline-none transition-all duration-150",
              "pr-10",
              "placeholder:text-transparent",
              "focus:border-auth-primary focus:ring-4 focus:ring-auth-primary/10",
              error ? "border-auth-danger focus:border-auth-danger focus:ring-auth-danger/10" : "border-auth-border",
              className
            )}
            {...props}
          />

          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-auth-muted transition-all duration-150",
              "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-auth-primary",
              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
              error && "peer-focus:text-auth-danger"
            )}
          >
            {label}
          </label>

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={0}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-auth-muted transition-colors hover:text-auth-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary focus-visible:ring-offset-2 focus-visible:ring-offset-auth-bg rounded-sm"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-auth-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";
