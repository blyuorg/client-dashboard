"use client";

import { LayoutGrid, List, Plus, Search, X, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DocumentsView } from "@/lib/documents/types";

export type DocumentSortKey = "name" | "modified" | "uploaded" | "size";

const SORT_LABELS: Record<DocumentSortKey, string> = {
  modified: "Last modified",
  uploaded: "Date uploaded",
  name: "Name",
  size: "File size",
};

export function DocumentsPageHeader({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  filtersOpen,
  onToggleFilters,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sort: DocumentSortKey;
  onSortChange: (value: DocumentSortKey) => void;
  view: DocumentsView;
  onViewChange: (value: DocumentsView) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="font-display text-3xl">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Securely organize, manage, preview, and access all project documents from one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className="w-52 rounded-full pl-9 pr-9"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              /
            </kbd>
          )}
        </div>

        <Button
          variant={filtersOpen ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={onToggleFilters}
          aria-pressed={filtersOpen}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {SORT_LABELS[sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(SORT_LABELS) as DocumentSortKey[]).map((key) => (
              <DropdownMenuItem key={key} onClick={() => onSortChange(key)}>
                {SORT_LABELS[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center rounded-full border border-border p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
              view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
              view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button size="sm" className="gap-1.5 rounded-full" disabled title="Coming soon">
          <Plus className="h-3.5 w-3.5" />
          Upload
        </Button>
      </div>
    </div>
  );
}
