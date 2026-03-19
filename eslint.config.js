// @ts-check
import openMfpAngularConfig from '@openmfp/eslint-config-typescript/angular.js';
import tsPlugin from 'typescript-eslint';

export default tsPlugin.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...openMfpAngularConfig,
  {
    files: ['**/*.html'],
    rules: {
      // TODO enable for accessibility
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
    },
  },
);
