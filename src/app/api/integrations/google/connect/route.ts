import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getGoogleAuthUrl } from "@/lib/integrations/google/auth";
import { createOAuthState } from "@/lib/security/oauth-state";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const state = createOAuthState(user.id, "google");
  return NextResponse.redirect(getGoogleAuthUrl(state));
}
