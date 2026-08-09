"use client";

import { LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ProjectSortKey } from "@/lib/project/compute";

const SORT_LABELS: Record<ProjectSortKey, string> = {
  updated: "Last updated",
  deadline: "Deadline",
  progress: "Progress",
  name: "Name",
};

export function ProjectPageHeader({
  sort,
  onSortChange,
  view,
  onViewChange,
}: {
  sort: ProjectSortKey;
  onSortChange: (value: ProjectSortKey) => void;
  view: "table" | "cards";
  onViewChange: (value: "table" | "cards") => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="font-display text-3xl">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage and track all projects assigned to your company.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {SORT_LABELS[sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(SORT_LABELS) as ProjectSortKey[]).map((key) => (
              <DropdownMenuItem key={key} onClick={() => onSortChange(key)}>
                {SORT_LABELS[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center rounded-full border border-border p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("table")}
            aria-label="Table view"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
              view === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("cards")}
            aria-label="Card view"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
              view === "cards" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
