"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_PALETTE, chartAxisColor, chartGridColor, chartTooltipStyle, EmptyChartState } from "./chart-theme";
import type { TimelinePoint } from "@/lib/dashboard/compute";

export function ProjectTimelineChart({ data }: { data: TimelinePoint[] }) {
  if (data.length === 0) {
    return (
      <EmptyChartState message="No completed milestones yet — the timeline fills in as milestones are checked off." />
    );
  }

  const projectKeys = Array.from(
    new Set(data.flatMap((point) => Object.keys(point).filter((key) => key !== "date")))
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
          <CartesianGrid stroke={chartGridColor} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: chartAxisColor, fontSize: 12 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fill: chartAxisColor, fontSize: 12 }} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: chartAxisColor }} />
          {projectKeys.map((key, i) => (
            <Line
              key={key}
              type="stepAfter"
              dataKey={key}
              stroke={CHART_PALETTE[i % CHART_PALETTE.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
