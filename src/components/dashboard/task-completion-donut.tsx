"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS, chartTooltipStyle, EmptyChartState } from "./chart-theme";

export function TaskCompletionDonut({ completed, remaining }: { completed: number; remaining: number }) {
  const total = completed + remaining;

  const data = useMemo(
    () =>
      [
        { name: "Completed", value: completed, color: CHART_COLORS.success },
        { name: "Remaining", value: remaining, color: CHART_COLORS.primary },
      ].filter((d) => d.value > 0),
    [completed, remaining]
  );

  if (total === 0) {
    return <EmptyChartState message="No tasks yet — this fills in once tasks are created." />;
  }

  const percent = Math.round((completed / total) * 100);

  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{percent}%</span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}
