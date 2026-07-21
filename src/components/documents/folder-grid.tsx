"use client";

import { motion } from "framer-motion";
import {
  FileSignature,
  Receipt,
  PenTool,
  Code2,
  Scale,
  Image as ImageIcon,
  FileBarChart,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentFolderDef } from "@/lib/documents/types";

const FOLDERS: (DocumentFolderDef & { icon: LucideIcon })[] = [
  { id: "contracts", label: "Contracts", icon: FileSignature },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "designs", label: "Designs", icon: PenTool },
  { id: "development", label: "Development", icon: Code2 },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "assets", label: "Assets", icon: ImageIcon },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "deliverables", label: "Deliverables", icon: PackageCheck },
];

export function FolderGrid({
  selectedFolderId,
  onSelectFolder,
}: {
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {FOLDERS.map((folder, i) => {
        const Icon = folder.icon;
        const active = selectedFolderId === folder.id;
        return (
          <motion.button
            key={folder.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelectFolder(active ? null : folder.id)}
            aria-pressed={active}
            className="text-left"
          >
            <Card
              className={cn(
                "flex h-full flex-col items-start gap-3 border p-4 transition-colors",
                active
                  ? "border-primary/50 bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-secondary/40"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  active ? "bg-primary/20 text-primary" : "bg-secondary text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium leading-tight">{folder.label}</span>
            </Card>
          </motion.button>
        );
      })}
    </div>
  );
}
