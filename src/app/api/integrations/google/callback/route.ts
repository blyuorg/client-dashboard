import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { exchangeGoogleCode, getGoogleUserInfo } from "@/lib/integrations/google/auth";
import { verifyOAuthState } from "@/lib/security/oauth-state";
import { upsertConnection } from "@/lib/integrations/connections";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const settingsUrl = new URL("/settings#integrations", url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return redirectWithError(settingsUrl, "google", "access_denied");
  if (!code || !state) return redirectWithError(settingsUrl, "google", "missing_params");

  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url));

  const statePayload = verifyOAuthState(state, "google");
  if (!statePayload || statePayload.userId !== user.id) {
    return redirectWithError(settingsUrl, "google", "invalid_state");
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const info = await getGoogleUserInfo(tokens.access_token);

    await upsertConnection(user.id, "google", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: tokens.scope,
      providerAccountId: info.id,
      providerAccountEmail: info.email,
    });
  } catch (error) {
    console.error("[google callback] connection failed", error instanceof Error ? error.message : error);
    return redirectWithError(settingsUrl, "google", "connection_failed");
  }

  settingsUrl.searchParams.set("connected", "google");
  return NextResponse.redirect(settingsUrl);
}

function redirectWithError(settingsUrl: URL, provider: string, reason: string) {
  const url = new URL(settingsUrl);
  url.searchParams.set("integration_error", provider);
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}
