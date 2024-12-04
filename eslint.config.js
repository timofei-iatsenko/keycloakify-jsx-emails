import linguiPlugin from "eslint-plugin-lingui";

import typescriptEslint from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import storybook from "eslint-plugin-storybook";

export default typescriptEslint.config(
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  ...storybook.configs["flat/recommended"],
  {
    ignores: ["dist/**", "**/locales/*.ts", "public/**"],
  },
  {
    plugins: {
      "react-refresh": reactRefresh,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-redeclare": "off",
      "no-labels": "off",
    },
  },
  {
    files: ["**/*.stories.*"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    ...linguiPlugin.configs["flat/recommended"],
    files: ["emails/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-refresh/only-export-components": "off",
      "react/no-unescaped-entities": "off",

      "lingui/no-expression-in-message": "off",
      "lingui/no-unlocalized-strings": [
        "warn",
        {
          ignore: [
            // Ignore strings that don’t start with an uppercase letter
            //   or don't contain two words separated by whitespace
            "^(?![A-Z].*|\\w+\\s\\w+).+$",
            // Ignore UPPERCASE literals
            // Example: const test = "FOO"
            "^[A-Z0-9_-]+$",
          ],
          ignoreNames: [
            // Ignore matching className (case-insensitive)
            { regex: { pattern: "className", flags: "i" } },
            // Ignore UPPERCASE names
            // Example: test.FOO = "ola!"
            { regex: { pattern: "^[A-Z0-9_-]+$" } },
            "styleName",
            "src",
            "srcSet",
            "type",
            "id",
            "width",
            "height",
            "displayName",
            "templateName",
          ],
          ignoreFunctions: [
            //
            "cva",
            "cn",
            "track",
            "Error",
            "console.*",
          ],
        },
      ],
    },
  },
);
