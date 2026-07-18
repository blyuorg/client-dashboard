"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, chartAxisColor, chartGridColor, chartTooltipStyle, EmptyChartState } from "./chart-theme";
import { formatCurrency } from "@/lib/utils";
import type { BillingChartRow } from "@/lib/dashboard/compute";

export function BillingProgressChart({ data }: { data: BillingChartRow[] }) {
  if (data.length === 0) {
    return <EmptyChartState message="No project budgets set yet — billing progress will show up here." />;
  }

  return (
    <div style={{ height: Math.max(240, data.length * 56) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke={chartGridColor} />
          <XAxis type="number" tick={{ fill: chartAxisColor, fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: chartAxisColor, fontSize: 12 }}
            tickFormatter={(value: string) => (value.length > 18 ? `${value.slice(0, 18)}…` : value)}
          />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => formatCurrency(value)} />
          <Legend wrapperStyle={{ fontSize: 12, color: chartAxisColor }} />
          <Bar dataKey="paid" stackId="a" name="Paid" fill={CHART_COLORS.success} radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" stackId="a" name="Pending" fill={CHART_COLORS.warning} />
          <Bar dataKey="remaining" stackId="a" name="Remaining" fill={CHART_COLORS.primary} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
