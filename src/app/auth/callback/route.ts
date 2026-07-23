import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges the OAuth `code` Supabase appends after a Google redirect for a
 * session, then sends the user on to /dashboard. `x-forwarded-host` is
 * trusted (instead of the request's own origin) because Vercel terminates
 * TLS at a proxy — using `origin` directly there would redirect to an
 * internal hostname instead of the public one.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv || !forwardedHost) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }

    console.error("[auth/callback] exchangeCodeForSession failed:", error);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
