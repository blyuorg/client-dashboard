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
};

export async function updateClientProfile(
  clientId: string,
  input: ClientProfileInput
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("profiles").update(input).eq("id", clientId);
  if (error) return { error: getReadableErrorMessage(error) };

  revalidatePath("/admin/clients");
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
