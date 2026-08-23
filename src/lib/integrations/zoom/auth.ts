import "server-only";

const AUTH_URL = "https://zoom.us/oauth/authorize";
const TOKEN_URL = "https://zoom.us/oauth/token";
const USERINFO_URL = "https://api.zoom.us/v2/users/me";
const REVOKE_URL = "https://zoom.us/oauth/revoke";

function getConfig() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, or ZOOM_REDIRECT_URI.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getZoomAuthUrl(state: string): string {
  const { clientId, redirectUri } = getConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};

function basicAuthHeader() {
  const { clientId, clientSecret } = getConfig();
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function parseTokenResponse(response: Response): Promise<ZoomTokenResponse> {
  if (!response.ok) {
    const body = await response.text();
    console.error("[zoom auth] token endpoint error", { status: response.status, body: body.slice(0, 500) });
    throw new Error("Zoom rejected the token request.");
  }
  return response.json();
}

export async function exchangeZoomCode(code: string): Promise<ZoomTokenResponse> {
  const { redirectUri } = getConfig();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  return parseTokenResponse(response);
}

export async function refreshZoomToken(refreshToken: string): Promise<ZoomTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  return parseTokenResponse(response);
}

export async function revokeZoomToken(token: string): Promise<void> {
  await fetch(REVOKE_URL, {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch((error) => {
    console.error("[zoom auth] revoke failed", error instanceof Error ? error.message : error);
  });
}

export async function getZoomUserInfo(accessToken: string): Promise<{ email: string | null; id: string | null }> {
  const response = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return { email: null, id: null };
  const data = await response.json();
  return { email: data.email ?? null, id: data.id ?? null };
}
