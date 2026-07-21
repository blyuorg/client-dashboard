"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PreviewPanelContent } from "@/components/documents/preview-panel-content";
import type { DocumentActivityEvent, DocumentRecord, DocumentVersion } from "@/lib/documents/types";

type PreviewPanelProps = {
  document: DocumentRecord | null;
  versions?: DocumentVersion[];
  activity?: DocumentActivityEvent[];
};

export function PreviewPanel({ document, versions, activity }: PreviewPanelProps) {
  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-7rem)] w-[340px] shrink-0 self-start overflow-y-auto rounded-2xl border border-border bg-card lg:block">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-semibold">Preview</h2>
      </div>
      <PreviewPanelContent document={document} versions={versions} activity={activity} />
    </aside>
  );
}

export function PreviewPanelDrawer({ document, versions, activity }: PreviewPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <PanelRight className="h-4 w-4" />
        Preview
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="flex flex-col overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Preview</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PreviewPanelContent document={document} versions={versions} activity={activity} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
