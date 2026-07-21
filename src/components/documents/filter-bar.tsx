"use client";

import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DROPDOWN_FILTERS: { label: string; emptyLabel: string }[] = [
  { label: "Category", emptyLabel: "No categories yet" },
  { label: "Project", emptyLabel: "No projects yet" },
  { label: "Date", emptyLabel: "No date ranges yet" },
  { label: "File Type", emptyLabel: "No file types yet" },
  { label: "Tags", emptyLabel: "No tags yet" },
];

export function FilterBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
          "border-primary/40 bg-primary/15 text-primary"
        )}
      >
        All Files
      </span>

      {DROPDOWN_FILTERS.map((filter) => (
        <DropdownMenu key={filter.label}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {filter.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel className="text-muted-foreground">{filter.emptyLabel}</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}

      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" disabled>
        <X className="h-3.5 w-3.5" />
        Clear Filters
      </Button>
    </div>
  );
}
