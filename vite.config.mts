import 'dotenv/config'
import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vite";
import { coverageConfigDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [angular()],
    test: {
      silent: "passed-only",
      globals: true,
      projects: [
        {
          extends: true,
          test: {
            include: ["src/app/**/*.spec.ts"],
            name: { label: "client", color: "red" },
            environment: "jsdom",
            setupFiles: ["src/test-setup.ts"],
          },
        },
        {
          extends: true,
          test: {
            include: ["src/server/api/**/*.spec.ts"],
            name: { label: "api", color: "blue" },
            environment: "node",
            poolOptions: {
              threads: {
                singleThread: true,
              },
            },
            fileParallelism: false,
          },
        },
        {
          extends: true,
          test: {
            include: ["src/server/**/*.spec.ts"],
            exclude: ["src/server/api/**/*.spec.ts"],
            name: { label: "services", color: "yellow" },
            environment: "node",
          },
        },
      ],
      reporters: ["default"],
      coverage: {
        provider: "istanbul",
        thresholds: {
          statements: 75,
          branches: 75,
        },
        exclude: [
          "src/server/api/trpc.ts",
          "src/server/api/api.routes.ts",
          "**/utils/**",
          "src/server/services/user.ts",
          "prisma/**",
          "src/roles.ts",
          "src/server/dummy/**",
          ...coverageConfigDefaults.exclude,
        ],
      },
      server: {
        deps: {
          inline: [/@fhss-web-team\/backend-utils/],
        },
      },
    },
    define: {
      "import.meta.vitest": mode !== "production",
    },
  };
});
