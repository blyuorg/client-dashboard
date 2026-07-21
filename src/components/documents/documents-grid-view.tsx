import { DocumentCard } from "@/components/documents/document-card";
import type { DocumentRecord } from "@/lib/documents/types";

export function DocumentsGridView({
  documents,
  selectedId,
  onSelect,
}: {
  documents: DocumentRecord[];
  selectedId?: string | null;
  onSelect: (document: DocumentRecord) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          selected={selectedId === document.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
