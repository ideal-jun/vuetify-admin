import vuetify from 'eslint-config-vuetify';
import checkFile from 'eslint-plugin-check-file';

const viewImportPattern = {
  group: ['@/views', '@/views/**', '**/views/**'],
  message: 'Only app wiring and the router should import views.',
};
const storeImportPattern = {
  group: ['@/store', '@/store/**', '**/store/**'],
  message: 'Shared components must receive state through props or composables.',
};
const componentImportPattern = {
  group: ['@/components', '@/components/**', '**/components/**'],
  message: 'This layer must not depend on presentation components.',
};

export default vuetify(
  {
    ts: true,
    // Oxfmt owns formatting and import order.
    stylistic: false,
    perfectionist: false,
  },
  {
    files: ['**/*.vue'],
    rules: {
      // Oxfmt does not implement these Vue SFC rules yet.
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
        },
      ],

      // Let Oxfmt own Vue template layout to avoid fixer conflicts.
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-quotes': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-multi-spaces': 'off',
      'vue/no-spaces-around-equal-signs-in-attribute': 'off',
      'vue/padding-line-between-tags': 'off',
      'vue/script-indent': 'off',
    },
  },
  {
    files: ['src/**/*'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          // Folder entry components keep the familiar index.vue convention.
          'src/**/index.vue': 'KEBAB_CASE',
          'src/**/*.vue': 'PASCAL_CASE',
          'src/**/*.store.ts': 'CAMEL_CASE',
          'src/**/*.types.ts': 'CAMEL_CASE',
          'src/**/*.d.ts': 'KEBAB_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'KEBAB_CASE',
        },
      ],
    },
  },
  {
    files: ['src/**/*'],
    rules: {
      // The backend contract uses "userName"; the compound-word rule is too opinionated for it.
      'unicorn/consistent-compound-words': 'off',
    },
  },
  {
    files: ['src/typings/**/*'],
    rules: {
      // Global d.ts files need the `import()` form and overloads to describe ambient types.
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/unified-signatures': 'off',
    },
  },
  {
    files: ['src/**/index.vue'],
    rules: {
      'check-file/filename-naming-convention': 'off',
    },
  },
  {
    // `_builtin` is a deliberate private-folder convention copied from soybean-admin.
    files: ['src/views/_builtin/**/*'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/folder-naming-convention': 'off',
    },
  },
  {
    files: ['src/components/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [viewImportPattern, storeImportPattern],
        },
      ],
    },
  },
  {
    files: ['src/store/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [viewImportPattern, componentImportPattern],
        },
      ],
    },
  },
  {
    files: ['src/service/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [viewImportPattern, componentImportPattern, storeImportPattern],
        },
      ],
    },
  },
  {
    files: ['src/layouts/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [viewImportPattern],
        },
      ],
    },
  },
);
