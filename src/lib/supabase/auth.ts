"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getReadableErrorMessage } from "@/lib/supabase/errors";

export type AuthResult<T> = { data: T | null; error: string | null };

export async function signIn(email: string, password: string): Promise<AuthResult<Session>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { data: null, error: getReadableErrorMessage(error) };
  return { data: data.session, error: null };
}

export type SignUpData = { user: User | null; session: Session | null };

/**
 * `session` is null when the project requires email confirmation — the
 * profiles row must NOT be inserted client-side in that case, since there's
 * no authenticated JWT yet and `auth.uid()` would be NULL for RLS. Profile
 * creation is instead handled by the `handle_new_user` DB trigger (see
 * supabase/schema.sql), which runs as SECURITY DEFINER at the same moment
 * the auth.users row is created, regardless of session state.
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<AuthResult<SignUpData>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: metadata ? { data: metadata } : undefined,
  });
  if (error) return { data: null, error: getReadableErrorMessage(error) };
  return { data: { user: data.user, session: data.session }, error: null };
}

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: getReadableErrorMessage(error) };
  return { error: null };
}

export async function getCurrentUser(): Promise<AuthResult<User>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { data: null, error: getReadableErrorMessage(error) };
  return { data: data.user, error: null };
}

export async function getSession(): Promise<AuthResult<Session>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) return { data: null, error: getReadableErrorMessage(error) };
  return { data: data.session, error: null };
}

export async function sendPasswordResetEmail(
  email: string,
  redirectTo: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: getReadableErrorMessage(error) };
  return { error: null };
}

export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: getReadableErrorMessage(error) };
  return { error: null };
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
