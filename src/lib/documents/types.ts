// Shared type contracts for the Documents page. No data lives here —
// these describe the shape components expect once wired to a real
// documents API / Supabase table.

export type DocumentStatus = "approved" | "pending_review" | "draft" | "archived";

export type DocumentRecord = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  project: string;
  version: string;
  uploadedAt: string;
  modifiedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
  folderId: string;
  isShared: boolean;
};

export type DocumentVersion = {
  id: string;
  version: string;
  date: string;
  time: string;
  editedBy: string;
};

export type DocumentActivityEvent = {
  id: string;
  label: string;
  date: string;
  time: string;
  actor: string;
};

export type DocumentFolderDef = {
  id: string;
  label: string;
};

export type DocumentsView = "grid" | "list";

export type DocumentsOverview = {
  totalDocuments: number;
  recentUploads: number;
  storageUsedLabel: string;
  sharedDocuments: number;
};
