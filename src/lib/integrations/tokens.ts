import "server-only";
import { getConnection, updateAccessToken } from "@/lib/integrations/connections";
import { refreshGoogleToken } from "@/lib/integrations/google/auth";
import { refreshZoomToken } from "@/lib/integrations/zoom/auth";
import { refreshMicrosoftToken } from "@/lib/integrations/microsoft/auth";
import type { OAuthProvider } from "@/types/database";

// Refresh proactively, before the token actually expires, so a request
// already in flight never races an expiry that happens mid-call.
const EXPIRY_BUFFER_MS = 2 * 60 * 1000;

export class ProviderNotConnectedError extends Error {
  constructor(public provider: OAuthProvider) {
    super(`${provider} is not connected.`);
    this.name = "ProviderNotConnectedError";
  }
}

export class ProviderReconnectRequiredError extends Error {
  constructor(public provider: OAuthProvider) {
    super(`${provider} needs to be reconnected.`);
    this.name = "ProviderReconnectRequiredError";
  }
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() - EXPIRY_BUFFER_MS <= Date.now();
}

async function refreshFor(provider: OAuthProvider, refreshToken: string) {
  switch (provider) {
    case "google": {
      const tokens = await refreshGoogleToken(refreshToken);
      return { accessToken: tokens.access_token, expiresIn: tokens.expires_in };
    }
    case "zoom": {
      const tokens = await refreshZoomToken(refreshToken);
      return { accessToken: tokens.access_token, expiresIn: tokens.expires_in };
    }
    case "microsoft": {
      const tokens = await refreshMicrosoftToken(refreshToken);
      return { accessToken: tokens.access_token, expiresIn: tokens.expires_in };
    }
  }
}

/**
 * Returns a guaranteed-valid access token for this user+provider,
 * transparently refreshing and persisting it first if it's expired or
 * about to be. Throws a typed error (not a generic Error) when the
 * connection is missing or the refresh itself fails, so callers can show
 * "Connect Google" vs "Reconnect Google" instead of a raw stack trace.
 */
export async function getValidAccessToken(userId: string, provider: OAuthProvider): Promise<string> {
  const connection = await getConnection(userId, provider);
  if (!connection) throw new ProviderNotConnectedError(provider);

  if (!isExpired(connection.expiresAt)) {
    return connection.accessToken;
  }

  if (!connection.refreshToken) {
    throw new ProviderReconnectRequiredError(provider);
  }

  try {
    const refreshed = await refreshFor(provider, connection.refreshToken);
    if (!refreshed) throw new Error("Unsupported provider");
    const expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
    await updateAccessToken(connection.id, refreshed.accessToken, expiresAt);
    return refreshed.accessToken;
  } catch (error) {
    // A refresh failure almost always means the refresh token itself was
    // revoked/invalidated (user revoked access in the provider's own
    // settings, password change, etc.) — never surface the underlying
    // provider error/token to the caller, just signal "reconnect".
    console.error(`[tokens] refresh failed for ${provider}`, error instanceof Error ? error.message : error);
    throw new ProviderReconnectRequiredError(provider);
  }
}
