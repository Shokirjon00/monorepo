/**
 * TECH DEBT — временные послабления для legacy-кода apps/admin и apps/client.
 *
 * Эти правила нарушены ~1174 раза в коде, унаследованном из двух отдельных
 * проектов. Они понижены до 'warn', чтобы CI был зелёным и ловил РЕГРЕССИИ
 * (границы FSD, реальные ошибки), а не тонул в накопленном долге.
 *
 * Политика ratchet: чиним категорию → возвращаем её в 'error' → удаляем отсюда.
 * Подключается ТОЛЬКО в apps/*; библиотеки в libs/* держим на строгом уровне.
 */
export default [
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/adjacent-overload-signatures': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@angular-eslint/prefer-inject': 'warn',
      '@angular-eslint/no-output-native': 'warn',
      'prefer-const': 'warn',
      'no-prototype-builtins': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // a11y — требуют правки разметки, не автофиксятся
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/role-has-required-aria': 'warn',
      '@angular-eslint/template/alt-text': 'warn',
    },
  },
];
