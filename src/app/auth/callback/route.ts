import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Exchanges the OAuth `code` Supabase appends after a Google redirect for a
 * session, writing the resulting cookies directly into the response.
 *
 * CRITICAL: This does NOT use the shared `createClient()` from server.ts.
 * That helper wraps `setAll()` in a try/catch so it can be safely imported
 * from Server Components (where cookies are read-only). Here in a Route
 * Handler we *must* write cookies into the `NextResponse` we return — if
 * `setAll` silently swallows, the session exchange succeeds on Supabase's
 * end but the browser never receives the session cookie, and the user
 * appears unauthenticated after the redirect.
 *
 * `x-forwarded-host` is trusted (instead of the request's own origin)
 * because Vercel terminates TLS at a proxy — using `origin` directly there
 * would redirect to an internal hostname instead of the public one.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const publicOrigin = isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`;

  // Build the error redirect once — used for missing code, missing env, or
  // exchange failure.
  const errorUrl = `${publicOrigin}/auth/callback/status?status=error`;

  // Validate env vars before they reach the Supabase constructor.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[auth/callback] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    console.error("[auth/callback] No code parameter in callback URL");
    return NextResponse.redirect(errorUrl);
  }

  // Start with a redirect response — cookie handlers write directly into it,
  // so the session cookie is part of the response the browser actually sees.
  const successUrl = `${publicOrigin}/auth/callback/status?status=success`;
  const response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Set on the request (for downstream middleware/edge) and on the
          // response (so the browser actually receives the cookie).
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(errorUrl);
  }

  return response;
}
