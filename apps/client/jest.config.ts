export default {
  displayName: 'client',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  coverageDirectory: '../../coverage/apps/client',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/app/modules/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1',
  },
  // uuid v13 — чистый ESM ("type": "module"), CJS-сборки нет: его нужно
  // прогонять через transform, иначе jest падает на `Unexpected token 'export'`
  transformIgnorePatterns: ['node_modules/(?!(?:uuid|.*\\.mjs$))'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
