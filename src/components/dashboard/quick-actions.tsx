"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UploadCloud, Eye, CreditCard, MessageSquare, CalendarPlus, LifeBuoy, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Action = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const actions: Action[] = [
  { label: "Upload Assets", icon: UploadCloud, href: "/documents" },
  { label: "Review Designs", icon: Eye, href: "/documents" },
  { label: "Pay Invoice", icon: CreditCard, href: "/billing" },
  { label: "Message Team", icon: MessageSquare, href: "/messages" },
  { label: "Book Meeting", icon: CalendarPlus },
  { label: "Create Support Request", icon: LifeBuoy },
];

export function QuickActions() {
  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const content = (
            <motion.div
              whileHover={action.href ? { y: -2 } : undefined}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className={cn(
                "flex h-full flex-col items-start gap-2 rounded-xl border border-border bg-secondary/40 p-4 transition-colors",
                action.href ? "cursor-pointer hover:border-primary/50 hover:bg-secondary/70" : "opacity-60"
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium leading-tight">{action.label}</span>
              {!action.href && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Coming soon</span>}
            </motion.div>
          );

          return action.href ? (
            <Link key={action.label} href={action.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={action.label}>{content}</div>
          );
        })}
      </div>
    </Card>
  );
}
