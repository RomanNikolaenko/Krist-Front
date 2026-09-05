// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],

      // `const { id, ...rest } = address` drops a field on purpose — that is the
      // point of the destructure, not a forgotten variable.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // A ControlValueAccessor starts life with no-op callbacks; Angular
      // replaces them on registration.
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
    },
  },

  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },

  /*
   * The listbox follows the ARIA pattern: options are not in the tab order, the
   * trigger owns the keyboard and names the active option through
   * aria-activedescendant. The rule only sees the option element, so it cannot
   * tell that the keyboard is already handled a level up.
   */
  {
    files: ['src/app/shared/ui/select.html'],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
    },
  },

  /*
   * The dialog closes on Escape through a host binding on the component, which
   * the template rule cannot see. Clicking the backdrop is the mouse shortcut
   * on top of that, not the only way out.
   */
  {
    files: ['src/app/shared/ui/modal.html'],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
    },
  },

  // Test doubles are allowed to be empty — that is what makes them doubles.
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
