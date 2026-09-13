import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default tseslint.config(
  {ignores:['.next/**','node_modules/**','next-env.d.ts','scripts/**']},
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {files:['**/*.ts','**/*.tsx'],plugins:{'react-hooks':hooks},rules:{'@typescript-eslint/no-unused-vars':'warn','@typescript-eslint/no-explicit-any':'warn','react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'warn'}},
  {files:['**/*.js','**/*.mjs','**/*.cjs'],languageOptions:{globals:{URL:'readonly',process:'readonly',module:'readonly',require:'readonly',__dirname:'readonly'}}}
);
