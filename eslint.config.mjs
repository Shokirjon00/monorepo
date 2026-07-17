import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            // app-внутренний импорт собственного env-конфига (только в apps/*)
            '^environments/environment$',
            // чтение версии приложения из корневого package.json
            '\\.\\./.*package\\.json$',
          ],
          depConstraints: [
            // ── Scope axis: приложения изолированы, shared доступен всем ──
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: ['scope:admin', 'scope:shared'],
            },
            {
              sourceTag: 'scope:client',
              onlyDependOnLibsWithTags: ['scope:client', 'scope:shared'],
            },
            // ── Layer axis (FSD): зависимости только вниз по слоям ──
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:page',
                'type:widget',
                'type:feature',
                'type:entity',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:page',
              onlyDependOnLibsWithTags: [
                'type:widget',
                'type:feature',
                'type:entity',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:widget',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:entity',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:entity', 'type:shared'],
            },
            {
              sourceTag: 'type:entity',
              onlyDependOnLibsWithTags: ['type:shared'],
            },
            {
              sourceTag: 'type:shared',
              onlyDependOnLibsWithTags: ['type:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
