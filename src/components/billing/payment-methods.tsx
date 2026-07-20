"use client";

import { motion } from "framer-motion";
import { CreditCard, Smartphone, Landmark, Plus, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/billing/empty-state";
import type { PaymentMethod } from "@/lib/dashboard/billing-types";

const ICONS: Record<PaymentMethod["type"], LucideIcon> = {
  visa: CreditCard,
  mastercard: CreditCard,
  upi: Smartphone,
  bank: Landmark,
};

export function PaymentMethods({ methods = [] }: { methods?: PaymentMethod[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Saved cards and accounts for billing</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        {methods.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment methods added"
            description="Add a card or bank account to get set up for billing."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {methods.map((method, i) => {
              const Icon = ICONS[method.type];
              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="group relative rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/50"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {method.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="mt-3 text-sm font-medium">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.detail}</p>
                  {method.meta && <p className="mt-0.5 text-xs text-muted-foreground/80">{method.meta}</p>}
                  <div className="mt-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
