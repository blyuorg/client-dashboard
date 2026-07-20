"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/billing/empty-state";
import { formatCurrency } from "@/lib/utils";
import type { PaymentProgress as PaymentProgressData } from "@/lib/dashboard/billing-types";

export function PaymentProgressCard({ progress }: { progress?: PaymentProgressData | null }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const targetPercent = progress?.percent ?? 0;

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimatedPercent(targetPercent));
    return () => cancelAnimationFrame(id);
  }, [targetPercent]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Payment Progress</CardTitle>
          <CardDescription>How much of your contract has been settled</CardDescription>
        </div>
        <Badge variant="secondary">{progress ? `${progress.percent}% Complete` : "No data"}</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {progress ? (
          <>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-semibold tracking-tight">{animatedPercent}%</span>
              <span className="pb-1 text-sm text-muted-foreground">
                {formatCurrency(progress.paidAmount)} of {formatCurrency(progress.totalAmount)}
              </span>
            </div>
            <Progress value={animatedPercent} className="h-3" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">Paid Amount</p>
                <p className="mt-1 text-lg font-semibold text-success">{formatCurrency(progress.paidAmount)}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">Remaining Balance</p>
                <p className="mt-1 text-lg font-semibold text-warning">
                  {formatCurrency(progress.totalAmount - progress.paidAmount)}
                </p>
              </div>
              <div className="hidden rounded-lg border border-border bg-secondary/30 p-3 sm:block">
                <p className="text-xs text-muted-foreground">Contract Total</p>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(progress.totalAmount)}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <Progress value={0} className="h-3" />
            <EmptyState
              icon={TrendingUp}
              title="No payment progress yet"
              description="Progress will appear here once your contract and payments are set up."
              compact
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
