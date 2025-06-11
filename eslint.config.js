import eslint from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // .eslintignore の代替
  {
    ignores: ['src-tauri/', 'doc/', '.vscode/', '.svelte-kit/'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  svelte.configs.recommended,
  // Node.js環境で利用される設定ファイル用
  // .mjs 拡張子じゃなくて .js 拡張子を利用しても良いように。
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  // Prettierと競合するルールを無効化
  prettier
);
