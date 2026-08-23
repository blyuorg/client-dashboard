import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      // Next's bundler swaps this to a no-op for genuine server bundles
      // (and to a throwing stub only for client bundles); vitest has no
      // such split, so every test runs as trusted server code. See
      // src/test/server-only-stub.ts.
      "server-only": path.resolve(dirname, "./src/test/server-only-stub.ts"),
    },
  },
  test: {
    // ECC/ is an unrelated scratch directory (not part of this app) that
    // happens to live inside the repo root — without this it gets scanned
    // for test files too, which is slow and picks up nothing relevant.
    exclude: ["**/node_modules/**", "**/ECC/**"],
  },
});
