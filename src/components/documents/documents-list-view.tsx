import { FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { formatDate, cn } from "@/lib/utils";
import type { DocumentRecord } from "@/lib/documents/types";

export function DocumentsListView({
  documents,
  selectedId,
  onSelect,
}: {
  documents: DocumentRecord[];
  selectedId?: string | null;
  onSelect: (document: DocumentRecord) => void;
}) {
  return (
    <div className="rounded-2xl border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[220px]">Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              onClick={() => onSelect(document)}
              className={cn("cursor-pointer transition-colors", selectedId === document.id && "bg-secondary/50")}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <p className="truncate font-medium">{document.fileName}</p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{document.category}</TableCell>
              <TableCell className="text-muted-foreground">{document.project}</TableCell>
              <TableCell className="text-muted-foreground">{document.version}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(document.uploadedAt)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(document.modifiedAt)}</TableCell>
              <TableCell>
                <DocumentStatusBadge status={document.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(document);
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
