import "server-only";
import { createClient } from "@/lib/supabase/server";
import { encryptToken, decryptToken } from "@/lib/security/encryption";
import type { OAuthProvider } from "@/types/database";

export type DecryptedConnection = {
  id: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  scope: string | null;
  providerAccountId: string | null;
  providerAccountEmail: string | null;
};

export async function getConnection(userId: string, provider: OAuthProvider): Promise<DecryptedConnection | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("meeting_provider_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    accessToken: decryptToken(data.access_token_encrypted),
    refreshToken: data.refresh_token_encrypted ? decryptToken(data.refresh_token_encrypted) : null,
    expiresAt: data.expires_at,
    scope: data.scope,
    providerAccountId: data.provider_account_id,
    providerAccountEmail: data.provider_account_email,
  };
}

export async function upsertConnection(
  userId: string,
  provider: OAuthProvider,
  tokens: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: string | null;
    scope?: string | null;
    providerAccountId?: string | null;
    providerAccountEmail?: string | null;
  }
): Promise<void> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    user_id: userId,
    provider,
    access_token_encrypted: encryptToken(tokens.accessToken),
    expires_at: tokens.expiresAt,
    scope: tokens.scope ?? null,
    provider_account_id: tokens.providerAccountId ?? null,
    provider_account_email: tokens.providerAccountEmail ?? null,
  };

  // Some providers don't reissue a refresh token on every consent
  // (Google, notably, only sends one the first time) — never overwrite a
  // stored one with null just because a later exchange omitted it.
  if (tokens.refreshToken) {
    payload.refresh_token_encrypted = encryptToken(tokens.refreshToken);
  }

  const { error } = await supabase.from("meeting_provider_connections").upsert(payload, { onConflict: "user_id,provider" });
  if (error) throw new Error(`Failed to save ${provider} connection: ${error.message}`);
}

export async function updateAccessToken(
  connectionId: string,
  accessToken: string,
  expiresAt: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meeting_provider_connections")
    .update({ access_token_encrypted: encryptToken(accessToken), expires_at: expiresAt })
    .eq("id", connectionId);
  if (error) throw new Error(`Failed to update access token: ${error.message}`);
}

export async function deleteConnection(userId: string, provider: OAuthProvider): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meeting_provider_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);
  if (error) throw new Error(`Failed to disconnect ${provider}: ${error.message}`);
}

export async function listConnections(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("meeting_provider_connections")
    .select("provider, provider_account_email, expires_at, updated_at")
    .eq("user_id", userId);
  return data ?? [];
}
