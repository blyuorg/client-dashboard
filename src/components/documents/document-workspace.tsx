"use client";

import { FolderOpen, SearchX, Upload, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentsEmptyState } from "@/components/documents/empty-state";
import { DocumentsGridView } from "@/components/documents/documents-grid-view";
import { DocumentsListView } from "@/components/documents/documents-list-view";
import type { DocumentRecord, DocumentsView } from "@/lib/documents/types";

export function DocumentWorkspace({
  documents,
  hasActiveSearch,
  view,
  selectedId,
  onSelect,
}: {
  documents: DocumentRecord[];
  hasActiveSearch: boolean;
  view: DocumentsView;
  selectedId?: string | null;
  onSelect: (document: DocumentRecord) => void;
}) {
  if (documents.length === 0 && hasActiveSearch) {
    return (
      <DocumentsEmptyState
        icon={SearchX}
        title="No search results"
        description="We couldn't find any documents matching your search. Try a different keyword."
      />
    );
  }

  if (documents.length === 0) {
    return (
      <DocumentsEmptyState
        icon={FolderOpen}
        title="No Documents Yet"
        description="Upload files to organize and manage your project documents."
        size="lg"
        className="rounded-2xl border border-dashed border-border"
      >
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button className="gap-1.5" disabled title="Coming soon">
            <Upload className="h-3.5 w-3.5" />
            Upload Document
          </Button>
          <Button variant="outline" className="gap-1.5" disabled title="Coming soon">
            <FolderPlus className="h-3.5 w-3.5" />
            Create Folder
          </Button>
        </div>
      </DocumentsEmptyState>
    );
  }

  return view === "grid" ? (
    <DocumentsGridView documents={documents} selectedId={selectedId} onSelect={onSelect} />
  ) : (
    <DocumentsListView documents={documents} selectedId={selectedId} onSelect={onSelect} />
  );
}
