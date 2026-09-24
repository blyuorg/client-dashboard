import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getMicrosoftAuthUrl } from "@/lib/integrations/microsoft/auth";
import { createOAuthState } from "@/lib/security/oauth-state";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const state = createOAuthState(user.id, "microsoft");
    return NextResponse.redirect(getMicrosoftAuthUrl(state));
  } catch {
    const settings = new URL("/settings", request.url);
    settings.searchParams.set("integration_error", "microsoft");
    settings.searchParams.set("reason", "not_configured");
    settings.hash = "integrations";
    return NextResponse.redirect(settings);
  }
}
