import { FolderKanban } from "lucide-react";

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <FolderKanban className="h-8 w-8" />
      </span>
      <p className="font-medium">No projects have been assigned yet.</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your projects will appear here once your agency assigns them.
      </p>
    </div>
  );
}

export function NoResultsState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
      <p className="font-medium">No projects match your filters.</p>
      <p className="text-sm text-muted-foreground">Try a different search term or clear the active filter.</p>
    </div>
  );
}
