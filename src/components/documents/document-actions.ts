import { Eye, Download, Share2, Link2, Pencil, FolderInput, Archive, Trash2, type LucideIcon } from "lucide-react";

export type DocumentAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
};

export const DOCUMENT_ACTIONS: DocumentAction[] = [
  { key: "preview", label: "Preview", icon: Eye },
  { key: "download", label: "Download", icon: Download },
  { key: "share", label: "Share", icon: Share2 },
  { key: "copy-link", label: "Copy Link", icon: Link2 },
  { key: "rename", label: "Rename", icon: Pencil },
  { key: "move", label: "Move", icon: FolderInput },
  { key: "archive", label: "Archive", icon: Archive },
  { key: "delete", label: "Delete", icon: Trash2, destructive: true },
];
