"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReadableErrorMessage } from "@/lib/supabase/errors";
import type { SettingsPreferences } from "@/lib/settings/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, error: "Your session has expired. Please log in again." };
  return { supabase, user, error: null };
}

export type GeneralProfileInput = {
  full_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
};

export async function updateGeneralProfile(input: GeneralProfileInput): Promise<{ error: string | null }> {
  const { supabase, user, error } = await requireUser();
  if (!user) return { error };

  const { error: updateError } = await supabase.from("profiles").update(input).eq("id", user.id);
  if (updateError) return { error: getReadableErrorMessage(updateError) };

  revalidatePath("/settings");
  return { error: null };
}

export async function savePreferences<K extends keyof SettingsPreferences>(
  section: K,
  values: SettingsPreferences[K]
): Promise<{ error: string | null }> {
  const { supabase, user, error } = await requireUser();
  if (!user) return { error };

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();
  if (fetchError) return { error: getReadableErrorMessage(fetchError) };

  const nextPreferences = { ...(profile?.preferences ?? {}), [section]: values };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ preferences: nextPreferences })
    .eq("id", user.id);
  if (updateError) return { error: getReadableErrorMessage(updateError) };

  revalidatePath("/settings");
  return { error: null };
}

export async function createSupportTicket(input: {
  subject: string;
  description: string;
}): Promise<{ error: string | null }> {
  const { supabase, user, error } = await requireUser();
  if (!user) return { error };
  if (!input.subject.trim()) return { error: "Give the ticket a subject." };

  const { error: insertError } = await supabase.from("support_tickets").insert({
    client_id: user.id,
    subject: input.subject.trim(),
    description: input.description.trim() || null,
  });
  if (insertError) return { error: getReadableErrorMessage(insertError) };

  return { error: null };
}

export async function exportAccountData(): Promise<{ data: string | null; error: string | null }> {
  const { supabase, user, error } = await requireUser();
  if (!user) return { data: null, error };

  const [profile, projects, invoices, payments, documents, tickets] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*").eq("client_id", user.id),
    supabase.from("invoices").select("*").eq("client_id", user.id),
    supabase.from("payments").select("*").eq("client_id", user.id),
    supabase.from("documents").select("id, file_name, folder, file_size, mime_type, created_at").eq("uploaded_by", user.id),
    supabase.from("support_tickets").select("*").eq("client_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    projects: projects.data ?? [],
    invoices: invoices.data ?? [],
    payments: payments.data ?? [],
    documents: documents.data ?? [],
    support_tickets: tickets.data ?? [],
  };

  return { data: JSON.stringify(payload, null, 2), error: null };
}

export async function deleteOwnAccount(): Promise<{ error: string | null }> {
  const { user, error } = await requireUser();
  if (!user) return { error };

  const admin = createAdminClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return { error: getReadableErrorMessage(deleteError) };

  return { error: null };
}
