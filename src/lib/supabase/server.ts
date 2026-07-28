import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore if you have
            // middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * `supabase.auth.getUser()` re-validates the JWT against the Supabase auth
 * server on every call (by design — unlike getSession(), it never trusts a
 * locally-stored value). The dashboard/admin layouts and the pages that
 * render inside them each independently call getUser(), which previously
 * meant 2+ auth round trips per request. Wrapping it in React's `cache()`
 * memoizes the result per request (same mechanism Next.js uses to dedupe
 * `fetch()`), so every call site in a single render pass shares one
 * network call without any call site needing to know about the others.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
