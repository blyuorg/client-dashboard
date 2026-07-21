"use client";

import { useMemo, useState } from "react";
import { DocumentsPageHeader, type DocumentSortKey } from "@/components/documents/documents-page-header";
import { FilterBar } from "@/components/documents/filter-bar";
import { OverviewCards } from "@/components/documents/overview-cards";
import { FolderGrid } from "@/components/documents/folder-grid";
import { DocumentWorkspace } from "@/components/documents/document-workspace";
import { PreviewPanel, PreviewPanelDrawer } from "@/components/documents/preview-panel";
import type { DocumentRecord, DocumentsView } from "@/lib/documents/types";

// No documents are seeded here — this page renders purely from empty
// state until a real documents API/table is connected.
const DOCUMENTS: DocumentRecord[] = [];

export function DocumentsPageClient() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DocumentSortKey>("modified");
  const [view, setView] = useState<DocumentsView>("grid");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const visibleDocuments = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      const matchesFolder = !selectedFolderId || doc.folderId === selectedFolderId;
      const matchesSearch = !search || doc.fileName.toLowerCase().includes(search.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  }, [selectedFolderId, search]);

  const selectedDocument = DOCUMENTS.find((doc) => doc.id === selectedDocumentId) ?? null;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-6 -mt-6 space-y-4 border-b border-border bg-background/95 px-6 pb-4 pt-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <DocumentsPageHeader
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
        />
        {filtersOpen && <FilterBar />}
      </div>

      <OverviewCards />

      <FolderGrid selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />

      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <DocumentWorkspace
            documents={visibleDocuments}
            hasActiveSearch={search.length > 0}
            view={view}
            selectedId={selectedDocumentId}
            onSelect={(doc) => setSelectedDocumentId(doc.id)}
          />
        </div>

        <PreviewPanel document={selectedDocument} />
      </div>

      <PreviewPanelDrawer document={selectedDocument} />
    </div>
  );
}
