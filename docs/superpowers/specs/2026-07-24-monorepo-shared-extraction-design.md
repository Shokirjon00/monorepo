# Извлечение общего кода admin/client в shared-библиотеки монорепо

Дата: 2026-07-24
Статус: утверждён

## Контекст

Монорепо на Nx содержит два Angular-приложения — `apps/admin` и `apps/client`. База настроена
корректно: теги `scope:*`/`type:*` с `@nx/enforce-module-boundaries`, кеширование, `nx affected`
в CI, первые библиотеки (`@eskhata/util`, `@eskhata/environment`, `@eskhata/session`) уже
используются в приложениях.

Ключевая проблема: главная цель монорепо не достигнута. 25 общих UI-компонентов
(`shared/components`) и ~79 файлов `core/` по-прежнему продублированы в обоих приложениях,
и копии разошлись — из ~160 парных файлов идентичны только 6. Пример: `toast` в client
переведён на `output()` и `PrimeTemplateDirective`, в admin остался на `EventEmitter` и
`PrimeTemplate`. Расхождение растёт с каждым изменением.

Сопутствующие недочёты:

- версии Nx не согласованы: `nx` 23.1.0 при `@nx/*` 22.0.1;
- `libs/shared/styles` и `libs/shared/assets` не являются Nx-проектами (нет `project.json`) —
  вне графа зависимостей, `affected` их изменения не отслеживает;
- `api: any` в общем интерфейсе `Environment`;
- дубли зависимостей (`uuid`+`uuidv4`, `print-js`+`print-js-updated`), устаревшие `moment`
  и `prettier` 2.x, `npm ci --legacy-peer-deps` в CI.

## Принятые решения

| Вопрос | Решение |
|---|---|
| Приоритет | Извлечение общих компонентов и core/ |
| Объём | 25 общих UI-компонентов + общая часть `core/` |
| Слияние разошедшихся копий | За основу — современная версия (обычно client), фичи второй копии переносятся в неё |
| Гранулярность библиотек | Сгруппированные: `ui`, `util`, `data-access`, `styles`, `assets` |
| Версия Angular | Фиксируется на 21.x, выше не поднимаем (`~21.x` в package.json) |

## Целевая структура

```
libs/
  shared/
    ui/           @eskhata/ui           — 25 общих компонентов        [scope:shared, type:shared]
    util/         @eskhata/util         — уже есть (enums, pipes, …)  [scope:shared, type:shared]
    data-access/  @eskhata/data-access  — общие сервисы, интерцепторы,
                                          guards, abstract-классы     [scope:shared, type:shared]
    environment/  @eskhata/environment  — уже есть                    [scope:shared, type:shared]
    styles/       — Nx-проект, общие SCSS
    assets/       — Nx-проект, общие иконки/шрифты
  entities/
    session/      @eskhata/session      — уже есть                    [scope:shared, type:entity]
```

Компоненты, существующие только в одном приложении (например, `transaction-card` в client,
`monaco-editor` в admin), остаются в своих приложениях. Директивы и пайпы из `core/`,
нужные общим компонентам, переезжают в `util` (чистые) или `data-access` (зависящие от
сервисов).

Список 25 общих компонентов: actions, autocomplete, bottom-sheet, breadcrumbs,
custom-select-list, dropdown, em-header, em-pagination, map, message-card, multi-dropdown,
multi-select, multi-select-list, pagination, password-input-rules, quick-filter, rating,
select-field-search, simple-select-list, tab-view, table, toast, top-button, upload-field,
validator.

## Порядок работ (3 волны)

### Волна 0 — подготовка

- `nx migrate` до согласованной версии: `nx` и все `@nx/*` на одном major (23.x),
  Angular закрепляется на `~21.x` — не выше.
- Добавить `project.json` для `libs/shared/styles` и `libs/shared/assets`
  (теги `scope:shared`, `type:shared`), чтобы они попали в граф зависимостей.

### Волна 1 — фундамент для компонентов

- Создать `libs/shared/ui` и `libs/shared/data-access` (пустые, с тегами и alias-путями
  `@eskhata/ui`, `@eskhata/data-access` в `tsconfig.base.json`).
- Перенести из `core/` зависимости общих компонентов: директивы (`click-outside`,
  `prime-template` и др.), абстракции (`DestroyableComponent`), общие сервисы
  (`HeaderService` и др.). Импорты `@core/*` в приложениях заменяются на `@eskhata/*`.

### Волна 2 — компоненты, партиями по 3–5

Для каждого компонента:

1. За основу берётся более современная версия (обычно client).
2. Недостающие фичи второй копии переносятся в основу.
3. Компонент кладётся в `libs/shared/ui`, оба приложения переключаются на `@eskhata/ui`,
   старые копии удаляются.

Порядок партий — от листовых компонентов (без зависимостей на другие компоненты)
к составным (`table` — в числе последних).

## Правила слияния разошедшихся копий

1. **Выбор основы**: версия на современном Angular API (`output()`, `input()`, signals,
   `viewChild()`). Если обе копии старые — берётся любая и переводится на современный API.
2. **Перенос фич**: `diff` двух копий; всё, что есть только во второй копии (инпуты, методы,
   куски шаблона), переносится в основу. Ничего не выбрасывается молча — предполагаемо
   мёртвые фичи фиксируются в описании PR как отдельное решение.
3. **Единый селектор и имя класса**: расхождения (`PrimeTemplate` vs `PrimeTemplateDirective`)
   разрешаются в пользу современного имени; правятся все точки использования.
4. **Стили**: SCSS компонента переезжает вместе с ним; зависимости от app-специфичных
   SCSS-переменных переключаются на `libs/shared/styles`.
5. **Deprecated-компоненты** (старый `pagination` с пометкой `@Deprecated use em-pagination`)
   не извлекаются — вместо этого точки использования переводятся на актуальный аналог
   (`em-pagination`).

## Риски и верификация

Главный риск — тихая поломка поведения в одном приложении, получившем «чужую» версию
компонента. Смягчение:

- партии по 3–5 компонентов, каждая — отдельный атомарный PR; откат — обычный revert;
- в PR перечисляются экраны обоих приложений, где компонент используется (`grep` по
  селектору), — чек-лист для ручной проверки;
- CI (`nx affected -t lint test build`) обязан быть зелёным для обоих приложений.

Верификация каждой волны:

- `nx run-many -t build lint test` проходит для обоих приложений;
- `nx graph` подтверждает, что `ui` зависит только от `util`/`data-access`/`styles`;
- ESLint-границы проходят: `scope:shared` не импортирует код приложений.

## Вне объёма (отдельные задачи на будущее)

- Типизация `Environment.api` (уход от `any`).
- Чистка зависимостей: `uuid`/`uuidv4`, `print-js`/`print-js-updated`, замена `moment`,
  обновление `prettier`, уход от `--legacy-peer-deps`.
- Наполнение слоёв `page`/`widget`/`feature` — теги уже настроены, библиотеки появятся
  по мере необходимости.
