"use client";

import { motion } from "framer-motion";
import { FileSignature, Wallet, CircleDollarSign, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BillingKpis } from "@/lib/dashboard/billing-types";

const CARD_META = [
  {
    key: "totalContractValue" as const,
    label: "Total Contract Value",
    icon: FileSignature,
    accent: "text-primary bg-primary/10",
  },
  {
    key: "amountPaid" as const,
    label: "Amount Paid",
    icon: Wallet,
    accent: "text-success bg-success/10",
  },
  {
    key: "outstandingBalance" as const,
    label: "Outstanding Balance",
    icon: CircleDollarSign,
    accent: "text-warning bg-warning/10",
  },
  {
    key: "nextInvoiceAmount" as const,
    label: "Next Invoice",
    icon: CalendarClock,
    accent: "text-[hsl(217,100%,65%)] bg-primary/10",
  },
];

export function BillingKpiCards({ kpis }: { kpis?: BillingKpis | null }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARD_META.map((item, i) => {
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
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    {kpis ? "Live" : "No data"}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {kpis ? (
                    <p className="text-2xl font-semibold leading-tight tracking-tight">
                      {formatCurrency(kpis[item.key])}
                    </p>
                  ) : (
                    <Skeleton className="h-7 w-24" />
                  )}
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground/80">
                    {kpis && item.key === "nextInvoiceAmount"
                      ? `Due ${formatDate(kpis.nextInvoiceDueDate)}`
                      : kpis ? "From your invoice records" : "Will populate once billing data is available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
