import { Badge } from "@/components/ui/badge";
import type { ProjectHealth } from "@/lib/project/compute";

const HEALTH_META: Record<ProjectHealth, { emoji: string; label: string; className: string }> = {
  on_track: { emoji: "\u{1F7E2}", label: "On Track", className: "bg-success/15 text-success" },
  needs_review: { emoji: "\u{1F7E1}", label: "Needs Review", className: "bg-warning/15 text-warning" },
  waiting_for_client: { emoji: "\u{1F7E0}", label: "Waiting for Client", className: "bg-orange-500/15 text-orange-500" },
  delayed: { emoji: "\u{1F534}", label: "Delayed", className: "bg-destructive/15 text-destructive" },
  planning: { emoji: "\u{1F535}", label: "Planning", className: "bg-primary/15 text-primary" },
};

export function HealthBadge({ health }: { health: ProjectHealth }) {
  const meta = HEALTH_META[health];
  return (
    <Badge variant="outline" className={`gap-1 border-transparent ${meta.className}`}>
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}

export function PhaseBadge({ phase }: { phase: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {phase}
    </Badge>
  );
}
