"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

// Lightweight accessible toggle switch. Deliberately not built on a
// Radix primitive since none is installed for this project — keeps
// the dependency footprint unchanged for a purely visual control.
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, id, className, ...props }, ref) => (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-secondary",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-1"
        )}
      />
    </button>
  )
);
Switch.displayName = "Switch";

export { Switch };
