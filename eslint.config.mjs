import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "*.config.js",
      "*.config.mjs",
      "next-env.d.ts",
      "jest.setup.js"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "@typescript-eslint/no-explicit-any": ["error", { "ignoreRestArgs": true }],
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];

export default eslintConfig;
