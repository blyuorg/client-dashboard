import type { Project } from "@/types/database";
import type { ProjectSummary } from "@/lib/dashboard/compute";

export type ProjectHealth = "on_track" | "needs_review" | "waiting_for_client" | "delayed" | "planning";

/**
 * There's no `health` column — it's derived from status/deadline/pace so it
 * stays accurate without anyone maintaining it by hand. `on_hold` and
 * `not_started` map directly; `in_progress` is judged against the deadline
 * and expected pace (days elapsed vs. days total, compared to actual
 * progress_percent).
 */
export function computeProjectHealth(project: Project): ProjectHealth {
  if (project.status === "on_hold") return "waiting_for_client";
  if (project.status === "not_started") return "planning";
  if (project.status === "completed") return "on_track";

  const now = Date.now();
  if (project.deadline && new Date(project.deadline).getTime() < now) {
    return "delayed";
  }

  if (project.start_date && project.deadline) {
    const start = new Date(project.start_date).getTime();
    const end = new Date(project.deadline).getTime();
    if (end > start) {
      const expectedPercent = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
      if (expectedPercent - project.progress_percent > 20) return "needs_review";
    }
  }

  return "on_track";
}

export type ProjectFilterKey =
  | "all"
  | "active"
  | "completed"
  | "paused"
  | "at_risk"
  | "overdue"
  | "recently_updated";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function filterSummaries(summaries: ProjectSummary[], filter: ProjectFilterKey): ProjectSummary[] {
  const now = Date.now();
  switch (filter) {
    case "active":
      return summaries.filter((s) => s.project.status === "in_progress");
    case "completed":
      return summaries.filter((s) => s.project.status === "completed");
    case "paused":
      return summaries.filter((s) => s.project.status === "on_hold");
    case "at_risk":
      return summaries.filter((s) => {
        const health = computeProjectHealth(s.project);
        return health === "needs_review" || health === "delayed";
      });
    case "overdue":
      return summaries.filter(
        (s) =>
          !!s.project.deadline &&
          new Date(s.project.deadline).getTime() < now &&
          s.project.status !== "completed"
      );
    case "recently_updated":
      return summaries.filter((s) => now - new Date(s.project.updated_at).getTime() < SEVEN_DAYS_MS);
    default:
      return summaries;
  }
}

export function searchSummaries(summaries: ProjectSummary[], query: string): ProjectSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return summaries;
  return summaries.filter(
    (s) =>
      s.project.title.toLowerCase().includes(q) ||
      (s.project.description ?? "").toLowerCase().includes(q) ||
      s.assignedEmployee.toLowerCase().includes(q)
  );
}

export type ProjectSortKey = "updated" | "deadline" | "progress" | "name";

export function sortSummaries(summaries: ProjectSummary[], sort: ProjectSortKey): ProjectSummary[] {
  const copy = [...summaries];
  switch (sort) {
    case "deadline":
      return copy.sort((a, b) => {
        if (!a.project.deadline) return 1;
        if (!b.project.deadline) return -1;
        return new Date(a.project.deadline).getTime() - new Date(b.project.deadline).getTime();
      });
    case "progress":
      return copy.sort((a, b) => b.project.progress_percent - a.project.progress_percent);
    case "name":
      return copy.sort((a, b) => a.project.title.localeCompare(b.project.title));
    default:
      return copy.sort((a, b) => new Date(b.project.updated_at).getTime() - new Date(a.project.updated_at).getTime());
  }
}

export function parseDeliverables(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
