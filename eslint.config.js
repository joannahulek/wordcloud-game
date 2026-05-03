import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.es2023,
        ...globals.browser,
        ...globals.node
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylistic,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "@stylistic/indent": ['error', 4],
      "@stylistic/no-multiple-empty-lines": ['error', { max: 1 }],
      "@stylistic/array-bracket-spacing": ['error', 'never'],
      "@stylistic/object-curly-spacing": ['error', 'always'],
      "@stylistic/no-trailing-spaces": ['error'],
    },
  },
]
