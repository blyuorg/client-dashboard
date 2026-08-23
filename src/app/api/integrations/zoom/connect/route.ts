import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getZoomAuthUrl } from "@/lib/integrations/zoom/auth";
import { createOAuthState } from "@/lib/security/oauth-state";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const state = createOAuthState(user.id, "zoom");
  return NextResponse.redirect(getZoomAuthUrl(state));
}
