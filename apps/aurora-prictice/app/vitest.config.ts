import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    maxConcurrency: 5,
    pool: "threads",
    poolOptions: {
      threads: {
        minThreads: 2,
        maxThreads: 5, // ← 1 にすると実質シングル
      },
    },
    setupFiles: ["./test/setup.ts"],
    coverage: {
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },
    env: {
      TZ: "Asia/Tokyo",
    },
    // watchExclude: ["**/.prisma/**", "**/src/.prisma/**", "**/node_modules/**"],
    hookTimeout: 30_000,
    globals: true,
  },
});
