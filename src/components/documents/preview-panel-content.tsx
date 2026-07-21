import { FileQuestion, History, Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DocumentsEmptyState } from "@/components/documents/empty-state";
import { DOCUMENT_ACTIONS } from "@/components/documents/document-actions";
import { formatDate } from "@/lib/utils";
import type { DocumentRecord, DocumentVersion, DocumentActivityEvent } from "@/lib/documents/types";

const INFO_FIELDS: { label: string; value: (doc: DocumentRecord) => string }[] = [
  { label: "File Name", value: (d) => d.fileName },
  { label: "File Type", value: (d) => d.fileType },
  { label: "File Size", value: (d) => `${d.fileSize} KB` },
  { label: "Upload Date", value: (d) => formatDate(d.uploadedAt) },
  { label: "Last Modified", value: (d) => formatDate(d.modifiedAt) },
  { label: "Uploaded By", value: (d) => d.uploadedBy },
];

export function PreviewPanelContent({
  document,
  versions = [],
  activity = [],
}: {
  document: DocumentRecord | null;
  versions?: DocumentVersion[];
  activity?: DocumentActivityEvent[];
}) {
  return (
    <div className="space-y-6 p-5">
      <section>
        <h3 className="mb-3 text-sm font-semibold">Document Preview</h3>
        {document ? (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-secondary/30">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
        ) : (
          <DocumentsEmptyState
            icon={FileQuestion}
            title="No document selected"
            description="Select a file to preview it here."
            size="sm"
            className="rounded-xl border border-dashed border-border"
          />
        )}
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Document Information</h3>
        {INFO_FIELDS.map((field) => (
          <div key={field.label} className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-muted-foreground">{field.label}</span>
            <span
              className={document ? "truncate text-right font-medium" : "truncate text-right font-medium text-muted-foreground/60"}
            >
              {document ? field.value(document) : "—"}
            </span>
          </div>
        ))}
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-sm font-semibold">Version History</h3>
        {versions.length === 0 ? (
          <DocumentsEmptyState
            icon={History}
            title="No version history"
            description="Versions will appear here once this file is updated."
            size="sm"
          />
        ) : (
          <ul className="space-y-4">
            {versions.map((version, i) => (
              <li key={version.id} className="relative flex gap-3 pl-1">
                {i !== versions.length - 1 && (
                  <span className="absolute left-[11px] top-6 h-[calc(100%-4px)] w-px bg-border" />
                )}
                <span className="mt-0.5 h-[9px] w-[9px] shrink-0 rounded-full border-2 border-primary bg-background" />
                <div>
                  <p className="text-sm font-medium">{version.version}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(version.date)} · {version.time} · {version.editedBy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-sm font-semibold">Recent Activity</h3>
        {activity.length === 0 ? (
          <DocumentsEmptyState
            icon={ActivityIcon}
            title="No recent activity"
            description="Actions on this document will show up here."
            size="sm"
          />
        ) : (
          <ul className="space-y-4">
            {activity.map((event) => (
              <li key={event.id} className="text-sm">
                <p className="font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(event.date)} · {event.time} · {event.actor}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-sm font-semibold">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {DOCUMENT_ACTIONS.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              size="sm"
              className={`justify-start gap-2 ${action.destructive ? "text-destructive hover:text-destructive" : ""}`}
              disabled={!document}
              title={document ? action.label : "Select a document first"}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
