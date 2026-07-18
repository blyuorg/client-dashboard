"use client";

import { cn } from "@/lib/utils";
import type { ProjectFilterKey } from "@/lib/project/compute";

const FILTERS: { key: ProjectFilterKey; label: string }[] = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "paused", label: "Paused" },
  { key: "at_risk", label: "At Risk" },
  { key: "overdue", label: "Overdue" },
  { key: "recently_updated", label: "Recently Updated" },
];

export function FilterChips({
  active,
  onChange,
  counts,
}: {
  active: ProjectFilterKey;
  onChange: (key: ProjectFilterKey) => void;
  counts: Record<ProjectFilterKey, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const isActive = filter.key === active;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {filter.label}
            <span className={cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground/70")}>
              {counts[filter.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
