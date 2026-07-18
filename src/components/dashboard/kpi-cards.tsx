"use client";

import { motion } from "framer-motion";
import { FolderKanban, Wallet, AlertCircle, TrendingUp, ClipboardCheck, PackageCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardKpis } from "@/lib/dashboard/compute";

const items = (kpis: DashboardKpis) => [
  {
    label: "Total Projects",
    value: kpis.totalProjects.toString(),
    icon: FolderKanban,
    accent: "text-primary",
  },
  {
    label: "Total Project Value",
    value: formatCurrency(kpis.totalProjectValue),
    icon: Wallet,
    accent: "text-primary",
  },
  {
    label: "Outstanding Balance",
    value: formatCurrency(kpis.outstandingBalance),
    icon: AlertCircle,
    accent: "text-warning",
  },
  {
    label: "Overall Completion",
    value: `${kpis.overallCompletion}%`,
    icon: TrendingUp,
    accent: "text-success",
  },
  {
    label: "Pending Approvals",
    value: kpis.pendingApprovals.toString(),
    icon: ClipboardCheck,
    accent: "text-warning",
  },
  {
    label: "Completed Deliverables",
    value: kpis.completedDeliverables.toString(),
    icon: PackageCheck,
    accent: "text-success",
  },
];

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items(kpis).map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-secondary ${item.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold leading-tight">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
