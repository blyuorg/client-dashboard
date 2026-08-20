import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function LinkCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={onClick ? undefined : "Coming soon"}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-all",
        onClick ? "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md" : "cursor-not-allowed opacity-60"
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
