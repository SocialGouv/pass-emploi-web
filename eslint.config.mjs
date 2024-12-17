import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import prettierConfigRecommended from 'eslint-plugin-prettier/recommended'
import reactCompiler from 'eslint-plugin-react-compiler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  prettierConfigRecommended,
  {
    rules: {
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          'newlines-between': 'always',
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel'] }],
      'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        'error',
        { ul: ['tablist'] },
      ],
    },
  },
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    settings: {
      'jsx-a11y': {
        components: {
          Table: 'table',
          TR: 'tr',
          TH: 'th',
          TD: 'td',
          TDLink: 'td',
          IconComponent: 'svg',
          Input: 'input',
          Select: 'select',
          Textarea: 'textarea',
          SelectButton: 'select',
        },
      },
    },
  },
]

export default eslintConfig
