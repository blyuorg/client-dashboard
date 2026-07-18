"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getDocumentDownloadUrl } from "@/lib/project/actions";
import type { Document } from "@/types/database";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesTab({ documents }: { documents: Document[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No files uploaded for this project yet.</p>;
  }

  async function handleDownload(doc: Document) {
    setError(null);
    setDownloadingId(doc.id);
    const { url, error: downloadError } = await getDocumentDownloadUrl(doc.storage_path);
    setDownloadingId(null);

    if (downloadError || !url) {
      setError(downloadError ?? "Couldn't generate a download link.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(doc.created_at)}
                {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={downloadingId === doc.id}
            onClick={() => handleDownload(doc)}
          >
            {downloadingId === doc.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download
          </Button>
        </div>
      ))}
    </div>
  );
}
