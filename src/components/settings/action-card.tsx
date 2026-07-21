import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  destructive,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  destructive?: boolean;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            destructive ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        variant={destructive ? "destructive" : "outline"}
        size="sm"
        className="shrink-0"
        onClick={onAction}
        {...(!onAction ? { disabled: true, title: "Coming soon" } : {})}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
