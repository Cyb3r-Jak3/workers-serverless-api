import { defineWorkersPoolOptions, } from "@cloudflare/vitest-pool-workers/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Use the same resolve conditions as `wrangler`
    conditions: ["workerd", "worker", "browser", "import"],
    // Vitest sets this to an empty array if unset, so restore Vite defaults:
    // https://github.com/vitest-dev/vitest/blob/v1.3.0/packages/vitest/src/node/plugins/index.ts#L77
    mainFields: ["browser", "module", "jsnext:main", "jsnext"],
  },
  ssr: {
    // Apply `package.json` `browser` field remapping in SSR mode:
    // https://github.com/vitejs/vite/blob/v5.1.4/packages/vite/src/node/plugins/resolve.ts#L175
    target: "webworker",
  },
  test: {
    pool: "@cloudflare/vitest-pool-workers",
    poolOptions: {
      workers: defineWorkersPoolOptions({
        isolatedStorage: true,
        main: "./src/index.ts", // TypeScript!
        miniflare: {
          kvNamespaces: ["KV"],
        },
        wrangler: {
          configPath: "./wrangler.toml",
        },
      }),
    },
  },
});