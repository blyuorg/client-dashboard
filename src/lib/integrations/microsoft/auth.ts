import "server-only";

// SCOPES cover creating/updating/cancelling Teams online meetings, plus
// the minimum profile info needed to show which Microsoft account is
// connected. `offline_access` is required to receive a refresh token.
const SCOPES = ["openid", "email", "offline_access", "OnlineMeetings.ReadWrite", "User.Read"];

function getConfig() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, or MICROSOFT_REDIRECT_URI.");
  }
  return { clientId, clientSecret, redirectUri, tenantId };
}

function authorityUrls(tenantId: string) {
  return {
    authUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  };
}

export function getMicrosoftAuthUrl(state: string): string {
  const { clientId, redirectUri, tenantId } = getConfig();
  const { authUrl } = authorityUrls(tenantId);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query",
    scope: SCOPES.join(" "),
    state,
  });
  return `${authUrl}?${params.toString()}`;
}

export type MicrosoftTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
};

async function parseTokenResponse(response: Response): Promise<MicrosoftTokenResponse> {
  if (!response.ok) {
    const body = await response.text();
    console.error("[microsoft auth] token endpoint error", { status: response.status, body: body.slice(0, 500) });
    throw new Error("Microsoft rejected the token request.");
  }
  return response.json();
}

export async function exchangeMicrosoftCode(code: string): Promise<MicrosoftTokenResponse> {
  const { clientId, clientSecret, redirectUri, tenantId } = getConfig();
  const { tokenUrl } = authorityUrls(tenantId);
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
      scope: SCOPES.join(" "),
    }),
  });
  return parseTokenResponse(response);
}

export async function refreshMicrosoftToken(refreshToken: string): Promise<MicrosoftTokenResponse> {
  const { clientId, clientSecret, tenantId } = getConfig();
  const { tokenUrl } = authorityUrls(tenantId);
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: SCOPES.join(" "),
    }),
  });
  return parseTokenResponse(response);
}

export async function getMicrosoftUserInfo(accessToken: string): Promise<{ email: string | null; id: string | null }> {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return { email: null, id: null };
  const data = await response.json();
  return { email: data.mail ?? data.userPrincipalName ?? null, id: data.id ?? null };
}
