"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { DocumentsPageHeader, type DocumentSortKey } from "@/components/documents/documents-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createDocumentRecord, deleteDocumentRecord, getDocumentUploadUrl, updateDocumentRecord } from "@/lib/admin/document-actions";
import { getDocumentDownloadUrl } from "@/lib/project/actions";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { DocumentRecord, DocumentsView } from "@/lib/documents/types";
import type { Project } from "@/types/database";

function formatFileSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPageClient({ documents, projects, isAdmin }: { documents: DocumentRecord[]; projects: Pick<Project, "id" | "title">[]; isAdmin: boolean }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DocumentSortKey>("uploaded");
  const [view, setView] = useState<DocumentsView>("list");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleDocuments = useMemo(() => {
    const matches = documents.filter((document) => document.fileName.toLowerCase().includes(search.toLowerCase()));
    return matches.sort((a, b) => {
      if (sort === "name") return a.fileName.localeCompare(b.fileName);
      if (sort === "size") return b.fileSize - a.fileSize;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [documents, search, sort]);

  async function handleDownload(document: DocumentRecord) {
    setError(null); setDownloadingId(document.id);
    const { url, error: downloadError } = await getDocumentDownloadUrl(document.storagePath, document.fileName);
    setDownloadingId(null);
    if (downloadError || !url) return setError(downloadError ?? "Couldn't generate a download link.");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleUpload(formData: FormData) {
    const file = formData.get("file"); const projectId = String(formData.get("projectId") ?? "");
    if (!(file instanceof File) || !file.size || !projectId) return setError("Choose a project and a file to upload.");
    setSaving(true); setError(null);
    const upload = await getDocumentUploadUrl(projectId, file.name);
    if (upload.error || !upload.path || !upload.token) { setSaving(false); return setError(upload.error ?? "Couldn't prepare the upload."); }
    const { error: storageError } = await createClient().storage.from("documents").uploadToSignedUrl(upload.path, upload.token, file);
    if (storageError) { setSaving(false); return setError(storageError.message); }
    const { error: recordError } = await createDocumentRecord({ projectId, fileName: file.name, storagePath: upload.path, fileSize: file.size, mimeType: file.type || null });
    setSaving(false);
    if (recordError) return setError(recordError);
    setUploadOpen(false); router.refresh();
  }

  async function handleEdit(formData: FormData) {
    if (!editing) return;
    setSaving(true); setError(null);
    const result = await updateDocumentRecord(editing.id, { fileName: String(formData.get("fileName") ?? "").trim(), projectId: String(formData.get("projectId") ?? "") });
    setSaving(false);
    if (result.error) return setError(result.error);
    setEditing(null); router.refresh();
  }

  async function handleDelete(document: DocumentRecord) {
    if (!window.confirm(`Delete ${document.fileName}? This cannot be undone.`)) return;
    setSaving(true); setError(null);
    const result = await deleteDocumentRecord(document.id);
    setSaving(false);
    if (result.error) return setError(result.error);
    router.refresh();
  }

  const actionButtons = (document: DocumentRecord) => <div className="flex justify-end gap-1">
    <Button variant="ghost" size="icon" onClick={() => handleDownload(document)} disabled={downloadingId === document.id} aria-label={`Download ${document.fileName}`}>{downloadingId === document.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</Button>
    {isAdmin && <><Button variant="ghost" size="icon" onClick={() => setEditing(document)} aria-label={`Edit ${document.fileName}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(document)} disabled={saving} aria-label={`Delete ${document.fileName}`}><Trash2 className="h-4 w-4" /></Button></>}
  </div>;

  return <div className="space-y-6">
    <DocumentsPageHeader search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} view={view} onViewChange={setView} isAdmin={isAdmin} onUpload={() => setUploadOpen(true)} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {visibleDocuments.length === 0 ? <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><FileText className="h-10 w-10 text-muted-foreground" /><div><h2 className="font-semibold">No documents yet</h2><p className="text-sm text-muted-foreground">{isAdmin ? "Upload a document to make it available for clients to download." : "Documents shared by your administrator will appear here."}</p></div>{isAdmin && <Button onClick={() => setUploadOpen(true)}><Upload className="mr-2 h-4 w-4" />Upload document</Button>}</CardContent></Card> : view === "list" ? <div className="rounded-2xl border border-border"><Table><TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Project</TableHead><TableHead>Size</TableHead><TableHead>Uploaded</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{visibleDocuments.map((document) => <TableRow key={document.id}><TableCell><div><p className="font-medium">{document.fileName}</p><p className="text-xs text-muted-foreground">{document.fileType}</p></div></TableCell><TableCell>{document.project}</TableCell><TableCell>{formatFileSize(document.fileSize)}</TableCell><TableCell>{formatDate(document.uploadedAt)}</TableCell><TableCell>{actionButtons(document)}</TableCell></TableRow>)}</TableBody></Table></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleDocuments.map((document) => <Card key={document.id}><CardContent className="space-y-4 p-5"><FileText className="h-8 w-8 text-primary" /><div><p className="truncate font-medium">{document.fileName}</p><p className="text-sm text-muted-foreground">{document.project} · {formatFileSize(document.fileSize)}</p></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{formatDate(document.uploadedAt)}</span>{actionButtons(document)}</div></CardContent></Card>)}</div>}
    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}><DialogContent><DialogHeader><DialogTitle>Upload document</DialogTitle><DialogDescription>Uploaded documents are immediately available for the selected client to download.</DialogDescription></DialogHeader><form action={handleUpload} className="space-y-4"><div className="space-y-2"><Label htmlFor="upload-project">Project</Label><select id="upload-project" name="projectId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div><div className="space-y-2"><Label htmlFor="upload-file">File</Label><Input id="upload-file" name="file" type="file" required /></div><DialogFooter><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Edit document</DialogTitle><DialogDescription>Update the document name or assign it to another project.</DialogDescription></DialogHeader>{editing && <form action={handleEdit} className="space-y-4"><div className="space-y-2"><Label htmlFor="edit-name">File name</Label><Input id="edit-name" name="fileName" defaultValue={editing.fileName} required /></div><div className="space-y-2"><Label htmlFor="edit-project">Project</Label><select id="edit-project" name="projectId" defaultValue={editing.projectId ?? ""} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div><DialogFooter><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button></DialogFooter></form>}</DialogContent></Dialog>
  </div>;
}
