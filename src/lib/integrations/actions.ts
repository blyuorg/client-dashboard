"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteConnection, getConnection } from "@/lib/integrations/connections";
import { revokeGoogleToken } from "@/lib/integrations/google/auth";
import { revokeZoomToken } from "@/lib/integrations/zoom/auth";
import type { OAuthProvider } from "@/types/database";

export async function disconnectProviderAction(provider: OAuthProvider): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired. Please log in again." };

  const connection = await getConnection(user.id, provider);
  if (connection) {
    // Best-effort revoke with the provider — the local row is removed
    // either way, so a revoke failure never blocks disconnecting in the app.
    if (provider === "google") await revokeGoogleToken(connection.accessToken);
    if (provider === "zoom") await revokeZoomToken(connection.accessToken);
    // Microsoft has no token-revoke endpoint in the v2.0 identity platform —
    // deleting the stored refresh token is the app's side of disconnecting;
    // the user can revoke consent from their Microsoft account if desired.
  }

  await deleteConnection(user.id, provider);
  revalidatePath("/settings");
  return { error: null };
}
