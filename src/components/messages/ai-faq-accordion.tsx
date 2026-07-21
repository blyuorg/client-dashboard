"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqCategory } from "@/lib/messages/types";

const CATEGORIES: FaqCategory[] = [
  { id: "general", label: "General Questions" },
  { id: "billing", label: "Billing" },
  { id: "projects", label: "Projects" },
  { id: "documents", label: "Documents" },
  { id: "support", label: "Support" },
  { id: "security", label: "Security" },
  { id: "timeline", label: "Timeline" },
  { id: "deliverables", label: "Deliverables" },
];

function FaqAccordionItem({ category }: { category: FaqCategory }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary/40"
      >
        {category.label}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 border-t border-border px-4 py-4 text-xs text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5 shrink-0" />
            No FAQs available yet for this category.
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiFaqAccordion() {
  return (
    <div className="space-y-2">
      {CATEGORIES.map((category) => (
        <FaqAccordionItem key={category.id} category={category} />
      ))}
    </div>
  );
}
