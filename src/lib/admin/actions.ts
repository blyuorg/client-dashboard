"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadableErrorMessage } from "@/lib/supabase/errors";
import type { BusinessType, ProjectPriority, ProjectStatus } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, error: "Your session has expired. Please log in again." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") return { supabase, error: "You don't have permission to do that." };

  return { supabase, error: null };
}

export type ClientProfileInput = {
  full_name?: string | null;
  company_name?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
  website?: string | null;
  business_type?: BusinessType | null;
  preferred_communication?: string | null;
  notes?: string | null;
  assigned_admin_id?: string | null;
};

export async function updateClientProfile(
  clientId: string,
  input: ClientProfileInput
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  // The edit form's plain <select>/<input> fields submit "" for "not set"
  // (uncontrolled HTML has no other way to express that) — business_type
  // is a Postgres enum with no "" member, so passing it through verbatim
  // fails the update outright. Every optional field here means the same
  // "clear it" intent whether it's "" or omitted, so normalize both.
  const sanitized = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === "" ? null : value])
  ) as ClientProfileInput;

  const { error } = await supabase.from("profiles").update(sanitized).eq("id", clientId);
  if (error) return { error: getReadableErrorMessage(error) };

  // Keep the 1-to-1 messaging conversation in sync with the assignment:
  // provisions it on first assignment, and re-points it (preserving message
  // history) on reassignment. Clearing the assignment (null) deliberately
  // leaves the conversation row alone — history stays intact and readable,
  // it just stops accepting new messages until someone is assigned again.
  if (input.assigned_admin_id) {
    const { error: conversationError } = await supabase
      .from("conversations")
      .upsert({ client_id: clientId, assigned_admin_id: input.assigned_admin_id }, { onConflict: "client_id" });
    if (conversationError) return { error: getReadableErrorMessage(conversationError) };
  }

  revalidatePath("/admin/clients");
  revalidatePath("/messages");
  return { error: null };
}

export type ProjectInput = {
  client_id: string;
  title: string;
  category?: string | null;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress_percent: number;
  start_date?: string | null;
  deadline?: string | null;
  estimated_completion?: string | null;
  budget?: number | null;
  deliverables?: string | null;
  requirements?: string | null;
  project_notes?: string | null;
};

export async function createProject(input: ProjectInput): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("projects").insert(input);
  if (error) return { error: getReadableErrorMessage(error) };

  revalidatePath("/admin/projects");
  return { error: null };
}

export async function updateProject(
  projectId: string,
  input: ProjectInput
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("projects").update(input).eq("id", projectId);
  if (error) return { error: getReadableErrorMessage(error) };

  revalidatePath("/admin/projects");
  return { error: null };
}

// Invoice create/update/send now lives in @/lib/invoices/actions — it needs
// to compute line items + GST totals server-side, which this file's plain
// ProjectInput-style actions don't model.
