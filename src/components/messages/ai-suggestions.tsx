"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Receipt,
  CalendarClock,
  UploadCloud,
  CalendarPlus,
  CreditCard,
  LifeBuoy,
  Code2,
  RefreshCw,
  FileEdit,
  type LucideIcon,
} from "lucide-react";

const SUGGESTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Project Status", icon: BarChart3 },
  { label: "Invoice Help", icon: Receipt },
  { label: "Timeline Questions", icon: CalendarClock },
  { label: "Upload Documents", icon: UploadCloud },
  { label: "Meeting Schedule", icon: CalendarPlus },
  { label: "Payment Queries", icon: CreditCard },
  { label: "Support Ticket", icon: LifeBuoy },
  { label: "Technical Questions", icon: Code2 },
  { label: "Request Revision", icon: RefreshCw },
  { label: "Change Request", icon: FileEdit },
];

export function AiSuggestions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SUGGESTIONS.map((suggestion, i) => {
        const Icon = suggestion.icon;
        return (
          <motion.button
            key={suggestion.label}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            whileHover={{ y: -1 }}
            title="Coming soon"
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-primary/40 hover:bg-secondary/40"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="truncate">{suggestion.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
