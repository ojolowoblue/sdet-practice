/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          // Include any normal .test.ts or .spec.ts files
          include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          // Exclude stories so they don't run twice
          exclude: ["**/*.stories.*", "node_modules", "tests/smoke"],
        },
      },
    ],
  },
});
