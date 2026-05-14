import { defineConfig } from "vitest/config"
import { resolve } from "path"

/**
 * Vitest configuration for API contract tests.
 *
 * - Tests live in `tests-api/` (separate from Playwright E2E in `tests/`)
 * - Node environment (these tests hit a running dev server, no DOM needed)
 * - 15s timeout (network round-trips to localhost + Supabase can be slow)
 * - Excludes `tests/**` so Playwright specs are not picked up
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests-api/**/*.test.ts", "tests-api/**/*.spec.ts"],
    exclude: ["tests/**", "node_modules/**", "dist/**", ".next/**"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    setupFiles: ["./tests-api/setup.ts"],
    globals: false,
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
