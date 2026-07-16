"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  in_progress: "#B9EEDD",
  completed: "#C4B8E8",
  on_hold: "#F3F1EA",
};

export function ProjectStatusDonut({
  data,
}: {
  data: { in_progress: number; completed: number; on_hold: number };
}) {
  const chartData = [
    { name: "In Progress", value: data.in_progress, color: COLORS.in_progress },
    { name: "Completed", value: data.completed, color: COLORS.completed },
    { name: "On Hold", value: data.on_hold, color: COLORS.on_hold },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No project status data yet — this fills in once projects are assigned.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#17171A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
