import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * AES-256-GCM encryption for OAuth tokens at rest (meeting_provider_connections
 * .access_token_encrypted / .refresh_token_encrypted). Server-only — never
 * import this from a Client Component.
 *
 * TOKEN_ENCRYPTION_KEY is a passphrase, not a raw key: scrypt derives a
 * proper 32-byte key from it so any sufficiently random string works,
 * without the operator needing to generate/paste actual key bytes.
 */

const IV_LENGTH = 12; // GCM standard nonce size
const SALT = "blyu-client-dashboard-token-encryption"; // fixed, non-secret — scrypt's job here is key stretching, not adding entropy

function getKey(): Buffer {
  const passphrase = process.env.TOKEN_ENCRYPTION_KEY;
  if (!passphrase || passphrase.length < 16) {
    throw new Error(
      "Missing or too-short TOKEN_ENCRYPTION_KEY. Set a random string of at least 32 characters " +
        "in your .env.local for local dev, and in Vercel under Project Settings → Environment " +
        "Variables for deployed builds. Generate one with: openssl rand -base64 32"
    );
  }
  return scryptSync(passphrase, SALT, 32);
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // iv.authTag.ciphertext, each base64 — self-contained so decrypt doesn't need a side-channel for the IV.
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptToken(stored: string): string {
  const [ivB64, authTagB64, dataB64] = stored.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Malformed encrypted token payload.");
  }
  const key = getKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}
