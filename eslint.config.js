// eslint.config.js
// @ts-check
import security from "eslint-plugin-security";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    security.configs.recommended,
    // drizzleConfigs.recommended,
  ],
  {
    rules: {
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-extra-semi": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-namespace": "off",
      "no-case-declarations": "off",
      "no-extra-semi": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
);
