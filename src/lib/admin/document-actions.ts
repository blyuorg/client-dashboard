"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadableErrorMessage } from "@/lib/supabase/errors";

type ActionResult = { error: string | null };
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv", "image/png", "image/jpeg", "image/webp",
]);

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Your session has expired. Please log in again." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, user: null, error: "You don't have permission to manage documents." };

  return { supabase, user, error: null };
}

function revalidateDocuments() {
  revalidatePath("/documents");
  revalidatePath("/admin/documents");
  revalidatePath("/project");
}

export async function getDocumentUploadUrl(
  projectId: string,
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<{ path: string | null; token: string | null; error: string | null }> {
  const { supabase, error } = await requireAdmin();
  if (error) return { path: null, token: null, error };
  if (!projectId || !fileName) return { path: null, token: null, error: "Choose a project and file to upload." };
  if (!Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > MAX_DOCUMENT_BYTES) {
    return { path: null, token: null, error: "Choose a file smaller than 20 MB." };
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { path: null, token: null, error: "This file type is not supported." };
  }
  const { data: project } = await supabase.from("projects").select("id").eq("id", projectId).maybeSingle();
  if (!project) return { path: null, token: null, error: "Project not found." };

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "document";
  const path = `${projectId}/${randomUUID()}-${safeName}`;
  const { data, error: uploadError } = await supabase.storage.from("documents").createSignedUploadUrl(path);
  if (uploadError || !data) return { path: null, token: null, error: getReadableErrorMessage(uploadError) };

  return { path: data.path, token: data.token, error: null };
}

export async function createDocumentRecord(input: {
  projectId: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string | null;
}): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error };
  if (!input.storagePath.startsWith(`${input.projectId}/`) || !ALLOWED_MIME_TYPES.has(input.mimeType ?? "") ||
      !Number.isSafeInteger(input.fileSize) || input.fileSize < 1 || input.fileSize > MAX_DOCUMENT_BYTES) {
    return { error: "Invalid document upload." };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    project_id: input.projectId,
    uploaded_by: user.id,
    folder: "others",
    file_name: input.fileName,
    storage_path: input.storagePath,
    file_size: input.fileSize,
    mime_type: input.mimeType,
  });
  if (insertError) {
    await supabase.storage.from("documents").remove([input.storagePath]);
    return { error: getReadableErrorMessage(insertError) };
  }

  revalidateDocuments();
  return { error: null };
}

export async function updateDocumentRecord(
  documentId: string,
  input: { fileName: string; projectId: string }
): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("documents")
    .update({ file_name: input.fileName, project_id: input.projectId })
    .eq("id", documentId);
  if (updateError) return { error: getReadableErrorMessage(updateError) };

  revalidateDocuments();
  return { error: null };
}

export async function deleteDocumentRecord(documentId: string): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { data: document, error: findError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();
  if (findError || !document) return { error: getReadableErrorMessage(findError) };

  const { error: storageError } = await supabase.storage.from("documents").remove([document.storage_path]);
  if (storageError) return { error: getReadableErrorMessage(storageError) };

  const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId);
  if (deleteError) return { error: getReadableErrorMessage(deleteError) };

  revalidateDocuments();
  return { error: null };
}
