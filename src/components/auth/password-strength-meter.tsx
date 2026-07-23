"use client";

import { Check, X } from "lucide-react";
import { getPasswordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

const SEGMENT_COLOR = [
  "bg-auth-border",
  "bg-auth-danger",
  "bg-auth-warning",
  "bg-auth-primary",
  "bg-auth-success",
];

const LABEL_COLOR = [
  "text-auth-muted",
  "text-auth-danger",
  "text-auth-warning",
  "text-auth-primary",
  "text-auth-success",
];

export function PasswordStrengthMeter({
  password,
  showChecklist = false,
}: {
  password: string;
  showChecklist?: boolean;
}) {
  const { score, label, checks } = getPasswordStrength(password);

  if (!password && !showChecklist) return null;

  return (
    <div className="space-y-2">
      {password && (
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((segment) => (
              <div
                key={segment}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  segment <= score ? SEGMENT_COLOR[score] : "bg-auth-border"
                )}
              />
            ))}
          </div>
          <p className={cn("text-xs font-medium transition-colors duration-300", LABEL_COLOR[score])}>
            {label}
          </p>
        </div>
      )}

      {showChecklist && (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
          <ChecklistItem met={checks.length} label="Minimum 8 characters" />
          <ChecklistItem met={checks.uppercase} label="Uppercase letter" />
          <ChecklistItem met={checks.number} label="Number" />
          <ChecklistItem met={checks.special} label="Special character" />
        </ul>
      )}
    </div>
  );
}

function ChecklistItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-1.5 text-xs transition-colors", met ? "text-auth-success" : "text-auth-muted")}>
      {met ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
      {label}
    </li>
  );
}
