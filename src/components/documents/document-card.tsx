"use client";

import { FileText, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { DOCUMENT_ACTIONS } from "@/components/documents/document-actions";
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "@/lib/documents/types";

export function DocumentCard({
  document,
  selected,
  onSelect,
}: {
  document: DocumentRecord;
  selected?: boolean;
  onSelect: (document: DocumentRecord) => void;
}) {
  return (
    <Card
      onClick={() => onSelect(document)}
      className={cn(
        "cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        selected && "border-primary/50 bg-primary/5"
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {DOCUMENT_ACTIONS.map((action) => (
                <div key={action.key}>
                  {action.destructive && <DropdownMenuSeparator />}
                  <DropdownMenuItem className={cn("gap-2", action.destructive && "text-destructive")}>
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{document.fileName}</p>
          <p className="text-xs uppercase text-muted-foreground">{document.fileType}</p>
        </div>

        <DocumentStatusBadge status={document.status} />
      </CardContent>
    </Card>
  );
}
