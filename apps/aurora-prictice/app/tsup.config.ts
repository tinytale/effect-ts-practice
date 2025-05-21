import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "./src/index.ts",
    },
    clean: true,
    platform: "node",
    target: "node24",
    bundle: true,
    minify: false,
    sourcemap: true,
    format: ["esm"],
    dts: false,
    splitting: true,
    skipNodeModulesBundle: true,
    outDir: "./dist",
    external: [],
    noExternal: [],
  },
]);
