import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    // Defense in depth: updateSession() already catches everything it can
    // throw, but if a future edit reintroduces an uncaught path, fail open
    // rather than crashing the request. The (dashboard)/(admin) layouts
    // re-verify the session server-side, so this never exposes protected
    // data — it just means one request skips the early redirect.
    console.error("[middleware] Unhandled error, passing request through:", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  // Scoped to exactly the routes updateSession() acts on (protected +
  // auth), rather than every non-asset request — the public marketing
  // page and any future public routes never need a Supabase round-trip,
  // and this shrinks the blast radius of an auth-service outage.
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/project/:path*",
    "/billing/:path*",
    "/documents/:path*",
    "/messages/:path*",
    "/meetings/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
  ],
};
