"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadableErrorMessage } from "@/lib/supabase/errors";
import type { ApprovalStatus } from "@/types/database";

export async function decideApproval(
  approvalId: string,
  decision: Extract<ApprovalStatus, "approved" | "changes_requested">,
  note?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired. Please log in again." };

  const { error } = await supabase
    .from("project_approvals")
    .update({ status: decision, note: note ?? null, decided_by: user.id, decided_at: new Date().toISOString() })
    .eq("id", approvalId);

  if (error) return { error: getReadableErrorMessage(error) };

  revalidatePath("/project");
  return { error: null };
}

export async function getDocumentDownloadUrl(storagePath: string): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(storagePath, 60);

  if (error) return { url: null, error: getReadableErrorMessage(error) };
  return { url: data.signedUrl, error: null };
}
