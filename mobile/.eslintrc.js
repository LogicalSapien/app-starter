module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "react-native"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native/all",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    "react-native/react-native": true,
    jest: true,
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "off",
    "react-native/no-raw-text": "off",
  },
  ignorePatterns: [
    "node_modules/",
    "coverage/",
    ".expo/",
    "dist/",
    "babel.config.js",
    "jest.config.js",
  ],
};
