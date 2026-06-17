import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' }

const componentGlobals = {
  App: 'readonly',
  CategoryCard: 'readonly',
  CategoryCardSkeleton: 'readonly',
  CategoryListSkeleton: 'readonly',
  CodeBlock: 'readonly',
  Empty: 'readonly',
  ExamConfigSkeleton: 'readonly',
  ExamHistorySkeleton: 'readonly',
  ExamResultSkeleton: 'readonly',
  Header: 'readonly',
  LearningPathDetailSkeleton: 'readonly',
  Markdown: 'readonly',
  PathCardSkeleton: 'readonly',
  PathListSkeleton: 'readonly',
  PitfallCard: 'readonly',
  QuestionCard: 'readonly',
  QuestionCardSkeleton: 'readonly',
  QuestionListSkeleton: 'readonly',
  QuestionDetailSkeleton: 'readonly',
  Skeleton: 'readonly',
  SkeletonCard: 'readonly',
  Category: 'readonly',
  ExamConfigPage: 'readonly',
  ExamHistoryPage: 'readonly',
  ExamResultPage: 'readonly',
  ExamTakePage: 'readonly',
  Home: 'readonly',
  LearningPathDetail: 'readonly',
  LearningPathList: 'readonly',
  QuestionDetail: 'readonly',
  SearchPage: 'readonly',
}

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...Object.fromEntries(
          Object.entries(autoImportGlobals.globals).map(([key, value]) => [
            key,
            value ? 'readonly' : 'off',
          ])
        ),
        ...componentGlobals,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
)
