import "server-only";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

// Minimum scopes for creating/reading/updating/deleting calendar events and
// generating Google Meet conference links. Deliberately not requesting
// broader Calendar or Drive access.
const SCOPES = ["openid", "email", "https://www.googleapis.com/auth/calendar.events"];

function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = getConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    // Forces Google to reissue a refresh token even for a user who's
    // authorized before — without this, a reconnect after a revoke can
    // silently come back with no refresh_token at all.
    prompt: "consent",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

async function parseTokenResponse(response: Response): Promise<GoogleTokenResponse> {
  if (!response.ok) {
    const body = await response.text();
    console.error("[google auth] token endpoint error", { status: response.status, body: body.slice(0, 500) });
    throw new Error("Google rejected the token request.");
  }
  return response.json();
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getConfig();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  return parseTokenResponse(response);
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getConfig();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  return parseTokenResponse(response);
}

export async function revokeGoogleToken(token: string): Promise<void> {
  await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch((error) => {
    // Best-effort — the local connection row is deleted regardless, so a
    // failed revoke just means the token dies naturally at expiry instead.
    console.error("[google auth] revoke failed", error instanceof Error ? error.message : error);
  });
}

export async function getGoogleUserInfo(accessToken: string): Promise<{ email: string | null; id: string | null }> {
  const response = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return { email: null, id: null };
  const data = await response.json();
  return { email: data.email ?? null, id: data.id ?? null };
}
