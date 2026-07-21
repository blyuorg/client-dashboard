"use client";

import { motion } from "framer-motion";
import { Files, UploadCloud, HardDrive, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS = [
  { label: "Total Documents", icon: Files, accent: "text-primary bg-primary/10" },
  { label: "Recent Uploads", icon: UploadCloud, accent: "text-success bg-success/10" },
  { label: "Storage Usage", icon: HardDrive, accent: "text-warning bg-warning/10" },
  { label: "Shared Documents", icon: Share2, accent: "text-[hsl(217,100%,65%)] bg-primary/10" },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="h-full transition-colors hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-6 w-16" />
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
