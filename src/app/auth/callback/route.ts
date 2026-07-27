import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges the OAuth `code` Supabase appends after a Google redirect for a
 * session. `x-forwarded-host` is trusted (instead of the request's own
 * origin) because Vercel terminates TLS at a proxy — using `origin` directly
 * there would redirect to an internal hostname instead of the public one.
 *
 * The exchange/error logic below is unchanged from before. The only edit for
 * the dark-glass redesign is the redirect *destination*: both branches now
 * land on the client-rendered /auth/callback/status page (which shows the
 * animated success/failure state the design calls for) instead of jumping
 * straight to /dashboard or /login — that page does the final navigation
 * itself after the transition finishes. A bare Route Handler can't render
 * that UI, so this one-hop redirect is the minimal way to get it without
 * touching how the session is actually established.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const publicOrigin = isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${publicOrigin}/auth/callback/status?status=success`);
    }

    console.error("[auth/callback] exchangeCodeForSession failed:", error);
  }

  return NextResponse.redirect(`${publicOrigin}/auth/callback/status?status=error`);
}
