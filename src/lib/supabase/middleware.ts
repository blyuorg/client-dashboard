import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

function classifyRoute(pathname: string) {
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/project") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  return { isAuthRoute, isProtectedRoute };
}

/**
 * Refreshes the Supabase session cookie and enforces route access.
 *
 * This function must never throw: an uncaught exception here becomes a
 * 500 MIDDLEWARE_INVOCATION_FAILED for every matched request, since Next.js
 * has no error boundary around Edge Middleware. Every fallible step below is
 * therefore validated or wrapped, and every exit path fails toward "redirect
 * unauthenticated users away from protected routes" rather than crashing —
 * the (dashboard) and (admin) layouts already re-check the session
 * server-side, so a fail-open response here never actually exposes
 * protected data if something upstream (env vars, Supabase itself) is down.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { isAuthRoute, isProtectedRoute } = classifyRoute(pathname);

  const redirectToLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  };

  let supabaseResponse = NextResponse.next({ request });

  // `!` is compile-time only — it does not stop `undefined` reaching
  // createServerClient() at runtime. Validate explicitly instead, since a
  // missing env var must never reach the Supabase client constructor.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — " +
        "check the Vercel project's Environment Variables for this environment."
    );
    // Fail safe, not fail crash: guard protected routes, let everything
    // else through unchanged. Guard against a redirect loop if /login
    // itself is ever added to isProtectedRoute in the future.
    if (isProtectedRoute && pathname !== "/login") {
      return redirectToLogin();
    }
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedRoute) {
      return redirectToLogin();
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    // Covers a bad/unreachable Supabase URL, a network failure to the auth
    // endpoint, or any other unexpected throw from the Supabase client —
    // none of which should ever surface as a crashed request.
    console.error("[middleware] Supabase session check failed:", error);
    if (isProtectedRoute && pathname !== "/login") {
      return redirectToLogin();
    }
    return NextResponse.next({ request });
  }
}
