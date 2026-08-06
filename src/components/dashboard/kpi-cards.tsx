import { FolderKanban, Wallet, TrendingUp, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardKpis } from "@/lib/dashboard/compute";

const items = (kpis: DashboardKpis) => [
  {
    label: "Projects",
    value: kpis.totalProjects.toString(),
    icon: FolderKanban,
    accent: "text-primary",
  },
  {
    label: "Project Value",
    value: formatCurrency(kpis.totalProjectValue),
    icon: Wallet,
    accent: "text-primary",
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
];

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items(kpis).map((item, i) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="h-full animate-fade-in-up transition-colors hover:border-primary/40"
            style={{ animationDelay: `${i * 40}ms` }}
          >
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
        );
      })}
    </div>
  );
}
