import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessagesEmptyState({
  icon: Icon,
  title,
  description,
  size = "md",
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}) {
  const iconBox = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const iconSize = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const padding = size === "lg" ? "py-16" : size === "sm" ? "py-6" : "py-10";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-center", padding, className)}>
      <span className={cn("flex items-center justify-center rounded-2xl bg-secondary text-muted-foreground", iconBox)}>
        <Icon className={iconSize} />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mx-auto max-w-xs text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
