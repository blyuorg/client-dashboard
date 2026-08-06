"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, chartAxisColor, chartGridColor, chartTooltipStyle, EmptyChartState } from "./chart-theme";
import type { DashboardProjectFields, ProjectSummary } from "@/lib/dashboard/compute";

function colorForProgress(percent: number) {
  if (percent >= 75) return CHART_COLORS.success;
  if (percent >= 40) return CHART_COLORS.primary;
  return CHART_COLORS.warning;
}

export function ProjectProgressChart({ summaries }: { summaries: ProjectSummary<DashboardProjectFields>[] }) {
  const data = useMemo(
    () =>
      summaries.map((s) => ({
        name: s.project.title,
        progress: s.project.progress_percent,
      })),
    [summaries]
  );

  if (summaries.length === 0) {
    return <EmptyChartState message="No projects yet — progress will show up here once one is assigned." />;
  }

  return (
    <div style={{ height: Math.max(220, data.length * 44) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke={chartGridColor} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: chartAxisColor, fontSize: 12 }} unit="%" />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: chartAxisColor, fontSize: 12 }}
            tickFormatter={(value: string) => (value.length > 18 ? `${value.slice(0, 18)}…` : value)}
          />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [`${value}%`, "Progress"]} />
          <Bar dataKey="progress" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={colorForProgress(entry.progress)} />
            ))}
            <LabelList
              dataKey="progress"
              position="right"
              formatter={(value: number) => `${value}%`}
              fill={chartAxisColor}
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
