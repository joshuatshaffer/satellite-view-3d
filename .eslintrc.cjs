module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["plugin:react-hooks/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs", "*.generated.*"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "@typescript-eslint/eslint-plugin"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/method-signature-style": "warn",
  },
};
