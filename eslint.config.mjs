import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import tseslint from 'typescript-eslint'

export default defineConfigWithVueTs(
  // Vue 3 strict rules
  pluginVue.configs['flat/recommended'],

  // TypeScript strict type-checked rules
  vueTsConfigs.recommendedTypeChecked,

  // Custom strict rules
  {
    name: 'strict-typescript-vue-rules',
    rules: {
      // 1. Enforce that imports must exist (TypeScript handles this better)
      'no-undef': 'off', // TypeScript compiler handles this
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // 2. Properties and methods must exist (type-aware rules)
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // 3. Explicit types for public APIs (more balanced)
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true, // Allow for simple expressions
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
      }],
      '@typescript-eslint/explicit-module-boundary-types': 'warn', // Warn instead of error
      '@typescript-eslint/no-inferrable-types': 'off', // Allow explicit types even if inferrable
      // Require types only for parameters and properties (most important)
      '@typescript-eslint/typedef': ['error', {
        arrayDestructuring: false,
        arrowParameter: false, // Too strict for inline functions
        memberVariableDeclaration: false, // Allow type inference for members
        objectDestructuring: false,
        parameter: true, // Require types for function parameters
        propertyDeclaration: true, // Require types for class properties
        variableDeclaration: false, // Allow const inference
        variableDeclarationIgnoreFunction: true,
      }],

      // 4. Strictly limit use of 'any' type
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',

      // Additional TypeScript rules (relaxed for practicality)
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for practical use
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',

      // Vue specific strict rules (relaxed for components)
      'vue/multi-word-component-names': 'off', // Allow single-word component names for library
      'vue/no-unused-components': 'error',
      'vue/no-unused-vars': 'error',
      'vue/require-prop-types': 'error',
      'vue/require-default-prop': 'off', // Too opinionated, especially for required props
      'vue/no-v-html': 'warn',
      'vue/component-api-style': 'off', // Allow both composition and options API
      'vue/block-lang': 'off', // Don't force TypeScript in examples
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': ['warn', {
        order: ['defineProps', 'defineEmits'],
      }],
      'vue/html-button-has-type': 'warn',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-static-inline-styles': 'warn',
      'vue/prefer-true-attribute-shorthand': 'warn',
      'vue/v-for-delimiter-style': ['warn', 'in'],
    },
  },

  // Configuration options
  {
    name: 'vue-project-config',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '__tests__/**',
      'examples/**',
      'vite.config.ts',
      'vitest.config.ts',
      'eslint.config.mjs',
    ],
  }
)
