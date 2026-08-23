// Vitest stand-in for the "server-only" package. Next.js's own bundler
// aliases "server-only" to a no-op specifically for genuine server
// bundles (and to the real throwing implementation only for client
// bundles) — vitest has no such distinction, and since every test here
// runs as trusted server-side Node code, this mirrors the server-side
// half of that behavior. See vitest.config.mts.
export {};
