"use client";

import { useMemo, useState } from "react";
import { ProjectPageHeader } from "./page-header";
import { FilterChips } from "./filter-chips";
import { ProjectsTableView } from "./projects-table-view";
import { ProjectsCardView } from "./projects-card-view";
import { ProjectDrawer } from "./project-drawer";
import { ProjectsEmptyState, NoResultsState } from "./empty-state";
import { filterSummaries, searchSummaries, sortSummaries, type ProjectFilterKey, type ProjectSortKey } from "@/lib/project/compute";
import type { ProjectSummary } from "@/lib/dashboard/compute";
import type { Activity, Document, Invoice, Meeting, Message, Milestone, ProjectApproval } from "@/types/database";

export function ProjectsPageClient({
  summaries,
  clientName,
  isAdmin,
  milestones,
  activities,
  approvals,
  documents,
  messages,
  meetings,
  invoices,
}: {
  summaries: ProjectSummary[];
  clientName: string;
  isAdmin: boolean;
  milestones: Milestone[];
  activities: Activity[];
  approvals: ProjectApproval[];
  documents: Document[];
  messages: Message[];
  meetings: Meeting[];
  invoices: Invoice[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilterKey>("all");
  const [sort, setSort] = useState<ProjectSortKey>("updated");
  const [view, setView] = useState<"table" | "cards">("table");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const keys: ProjectFilterKey[] = [
      "all",
      "active",
      "completed",
      "paused",
      "at_risk",
      "overdue",
      "recently_updated",
    ];
    return Object.fromEntries(keys.map((key) => [key, filterSummaries(summaries, key).length])) as Record<
      ProjectFilterKey,
      number
    >;
  }, [summaries]);

  const visible = useMemo(() => {
    const filtered = filterSummaries(summaries, filter);
    const searched = searchSummaries(filtered, search);
    return sortSummaries(searched, sort);
  }, [summaries, filter, search, sort]);

  const selected = summaries.find((s) => s.project.id === selectedId) ?? null;

  if (summaries.length === 0) {
    return (
      <div className="space-y-6">
        <ProjectPageHeader
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
          isAdmin={isAdmin}
        />
        <ProjectsEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectPageHeader
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
        isAdmin={isAdmin}
      />

      <FilterChips active={filter} onChange={setFilter} counts={counts} />

      {visible.length === 0 ? (
        <NoResultsState />
      ) : view === "table" ? (
        <ProjectsTableView summaries={visible} clientName={clientName} onSelect={(s) => setSelectedId(s.project.id)} />
      ) : (
        <ProjectsCardView summaries={visible} clientName={clientName} onSelect={(s) => setSelectedId(s.project.id)} />
      )}

      <ProjectDrawer
        summary={selected}
        clientName={clientName}
        milestones={milestones}
        activities={activities}
        approvals={approvals}
        documents={documents}
        messages={messages}
        meetings={meetings}
        invoices={invoices}
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}
