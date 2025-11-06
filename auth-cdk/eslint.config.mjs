// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "node_modules/",
    "cdk.out/", // Add your specific CDK output directory here
    "dist/",
    "build/",
    "jest.config.js",
    "*.generated.ts", // Ignore specific generated files
    "**/.*", // Ignore dotfiles (no longer default behavior in flat config)
  ]),

  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
);
