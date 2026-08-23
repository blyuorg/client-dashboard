import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { exchangeMicrosoftCode, getMicrosoftUserInfo } from "@/lib/integrations/microsoft/auth";
import { verifyOAuthState } from "@/lib/security/oauth-state";
import { upsertConnection } from "@/lib/integrations/connections";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const settingsUrl = new URL("/settings#integrations", url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return redirectWithError(settingsUrl, "access_denied");
  if (!code || !state) return redirectWithError(settingsUrl, "missing_params");

  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url));

  const statePayload = verifyOAuthState(state, "microsoft");
  if (!statePayload || statePayload.userId !== user.id) {
    return redirectWithError(settingsUrl, "invalid_state");
  }

  try {
    const tokens = await exchangeMicrosoftCode(code);
    const info = await getMicrosoftUserInfo(tokens.access_token);

    await upsertConnection(user.id, "microsoft", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: tokens.scope,
      providerAccountId: info.id,
      providerAccountEmail: info.email,
    });
  } catch (error) {
    console.error("[microsoft callback] connection failed", error instanceof Error ? error.message : error);
    return redirectWithError(settingsUrl, "connection_failed");
  }

  settingsUrl.searchParams.set("connected", "microsoft");
  return NextResponse.redirect(settingsUrl);
}

function redirectWithError(settingsUrl: URL, reason: string) {
  const url = new URL(settingsUrl);
  url.searchParams.set("integration_error", "microsoft");
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}
