import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Signed, expiring OAuth `state` parameter — the standard CSRF defense for
 * an OAuth authorization-code flow. Encodes which user initiated the
 * connect flow and for which provider, so the callback can verify the
 * redirect wasn't forged and route the tokens to the right row, without a
 * server-side session/store for in-flight OAuth attempts.
 */

const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes — generous for a consent screen, short enough to limit replay

function getSecret(): string {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("Missing TOKEN_ENCRYPTION_KEY — required to sign OAuth state parameters.");
  }
  return secret;
}

export type OAuthStatePayload = {
  userId: string;
  provider: "google" | "zoom" | "microsoft";
  nonce: string;
  issuedAt: number;
};

export function createOAuthState(userId: string, provider: OAuthStatePayload["provider"]): string {
  const payload: OAuthStatePayload = { userId, provider, nonce: randomBytes(12).toString("hex"), issuedAt: Date.now() };
  const json = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(json).digest("base64url");
  return `${json}.${signature}`;
}

export function verifyOAuthState(state: string, expectedProvider: OAuthStatePayload["provider"]): OAuthStatePayload | null {
  const [json, signature] = state.split(".");
  if (!json || !signature) return null;

  const expectedSignature = createHmac("sha256", getSecret()).update(json).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(Buffer.from(json, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (payload.provider !== expectedProvider) return null;
  if (Date.now() - payload.issuedAt > STATE_MAX_AGE_MS) return null;

  return payload;
}
