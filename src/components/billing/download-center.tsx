import { FileText, Receipt, ShieldCheck, FileSignature, Download, FolderOpen, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/billing/empty-state";
import { formatDate } from "@/lib/utils";
import type { DownloadFile, DownloadFileType } from "@/lib/dashboard/billing-types";

const ICONS: Record<DownloadFileType, LucideIcon> = {
  invoice: FileText,
  receipt: Receipt,
  tax: ShieldCheck,
  contract: FileSignature,
};

export function DownloadCenter({ files = [] }: { files?: DownloadFile[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Center</CardTitle>
        <CardDescription>Invoices, receipts and contract documents</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No files available yet"
            description="Invoices, receipts and contracts will appear here once generated."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {files.map((file) => {
              const Icon = ICONS[file.type];
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(file.date)} · {file.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Download ${file.name}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
