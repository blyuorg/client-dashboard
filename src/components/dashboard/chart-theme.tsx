// Hardcoded to the dark design-spec hex values (see globals.css comment) rather
// than hsl(var(--x)) — recharts renders these into raw SVG fill/stroke
// attributes, which don't reliably resolve CSS custom properties.
export const CHART_COLORS = {
  primary: "#4F8CFF",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  violet: "#A78BFA",
  mint: "#2DD4BF",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.violet,
  CHART_COLORS.mint,
  CHART_COLORS.warning,
  CHART_COLORS.success,
  CHART_COLORS.danger,
];

export const chartTooltipStyle = {
  background: "#17171A",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

export const chartGridColor = "rgba(255,255,255,0.08)";
export const chartAxisColor = "rgba(255,255,255,0.45)";

export function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
