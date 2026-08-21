# Monorepo Shared Code Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Извлечь 25 общих UI-компонентов и общую часть `core/` из `apps/admin` и `apps/client` в shared-библиотеки Nx (`@eskhata/ui`, `@eskhata/util`, `@eskhata/data-access`), устранив дублирование.

**Architecture:** Три волны: (0) выравнивание версий Nx/Angular и оформление styles/assets как Nx-проектов; (1) создание библиотек `ui`/`data-access` и перенос зависимостей компонентов из `core/`; (2) извлечение компонентов партиями по 3–5 с объединением разошедшихся копий (за основу — современная версия, обычно client).

**Tech Stack:** Nx 23.x, Angular 21.x, ESLint flat config c `@nx/enforce-module-boundaries`, Jest.

**Spec:** `docs/superpowers/specs/2026-07-24-monorepo-shared-extraction-design.md`

## Global Constraints

- **Angular строго `~21.x` — НЕ выше** (не переходить на 22.x, даже если `nx migrate` предлагает).
- `nx` и все пакеты `@nx/*` — на одном major/minor: **23.1.0**.
- Все новые библиотеки: теги `["scope:shared", "type:shared"]`, prefix `em`.
- Alias-пути добавляются в **3 файла**: `tsconfig.base.json`, `apps/admin/tsconfig.json`, `apps/client/tsconfig.json` (приложения дублируют paths относительными путями — это существующий паттерн, следовать ему).
- После каждой задачи: `npx nx run-many -t lint build --projects=admin,client` должен быть зелёным. Из-за WSL на `/mnt/c` сборки и git-операции медленные — таймауты ставить от 10 минут.
- Коммит после каждой задачи. Сообщения: `feat(monorepo): …` / `refactor(monorepo): …` / `chore(monorepo): …`.
- **Правило слияния копий**: за основу — версия на современном API (`output()`, `input()`, signals, `viewChild()`), обычно client. Фичи, существующие только во второй копии, переносятся. Ничего не удалять молча — спорные/мёртвые фичи перечислять в сообщении коммита.
- **Правило импортов в извлечённом коде**: `@core/*` → `@eskhata/util` или `@eskhata/data-access`; `@environments/environment` → `@eskhata/environment`; импорты `@shared/*` и `@modules/*` в shared-коде запрещены (границы ESLint это проверят).
- App-специфичные компоненты (лоадеры `eb-loader`/`eskhata-bank-loader`, диалоги) в shared-код не переносятся; где они нужны — параметризовать через `<ng-content>` или `TemplateRef`-input.

---

### Task 1: Выровнять версии Nx (23.1.0) и Angular (~21.x)

**Files:**
- Modify: `package.json` (версии `@nx/*`, `@angular/*`)
- Modify: `package-lock.json` (автоматически)
- Possibly modify: файлы, затронутые Nx/Angular-миграциями

**Interfaces:**
- Produces: согласованный тулчейн — `nx report` показывает nx 23.1.0 и все `@nx/*` 23.1.0, `@angular/core` 21.x. Все последующие задачи выполняются на этих версиях.

- [ ] **Step 1: Зафиксировать текущее состояние**

Run: `npx nx report`
Expected: nx 23.1.0, @nx/* 22.0.1 (рассинхрон), Angular 20.3.x.

- [ ] **Step 2: Запустить миграцию Nx**

```bash
npx nx migrate nx@23.1.0
```

Expected: `package.json` обновлён (`@nx/*` → 23.1.0), создан `migrations.json`.

- [ ] **Step 3: Проверить и ограничить версии Angular в package.json**

Открыть `package.json`. Если миграция подняла `@angular/*` выше 21.x — вручную заменить на последнюю доступную `~21.x` (проверить: `npm view @angular/core versions --json | tail -20`). Если миграция оставила 20.3 — поднять Angular отдельно:

```bash
npx nx migrate @angular/core@21
```

Все пакеты `@angular/*` в итоге должны иметь диапазон `~21.<latest-minor>.0`. Сопутствующие пакеты (`@angular/cdk`, `@angular/material`, `angular-eslint`, `jest-preset-angular`, `@angular/ssr`) — на совместимые с Angular 21 версии.

- [ ] **Step 4: Установить зависимости и прогнать миграции**

```bash
npm install --legacy-peer-deps
npx nx migrate --run-migrations
```

Expected: миграции завершаются без ошибок. Если какая-то миграция падает — читать её вывод, чинить, не пропускать молча.

- [ ] **Step 5: Верифицировать**

```bash
npx nx report
npx nx run-many -t lint build --projects=admin,client
npx nx run-many -t test --projects=admin,client
```

Expected: nx = 23.1.0, все @nx/* = 23.1.0, @angular/core = 21.x; lint/build/test зелёные для обоих приложений.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json migrations.json $(git diff --name-only)
git commit -m "chore(monorepo): align nx to 23.1.0 and angular to ~21.x"
```

---

### Task 2: Оформить styles и assets как Nx-проекты

**Files:**
- Create: `libs/shared/styles/project.json`
- Create: `libs/shared/assets/project.json`
- Modify: `apps/admin/project.json` (implicitDependencies)
- Modify: `apps/client/project.json` (implicitDependencies)

**Interfaces:**
- Produces: проекты `styles` и `assets` в графе Nx; изменения в них инвалидируют кеш сборок admin/client через `implicitDependencies`.

- [ ] **Step 1: Создать `libs/shared/styles/project.json`**

```json
{
  "name": "styles",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/styles",
  "projectType": "library",
  "tags": ["scope:shared", "type:shared"],
  "targets": {}
}
```

- [ ] **Step 2: Создать `libs/shared/assets/project.json`**

```json
{
  "name": "assets",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/shared/assets",
  "projectType": "library",
  "tags": ["scope:shared", "type:shared"],
  "targets": {}
}
```

- [ ] **Step 3: Добавить implicitDependencies в оба приложения**

В `apps/admin/project.json` и `apps/client/project.json`, рядом с ключом `"tags"`, добавить:

```json
"implicitDependencies": ["styles", "assets"]
```

- [ ] **Step 4: Верифицировать граф**

```bash
npx nx show projects | sort
npx nx graph --file=/tmp/claude-graph.json && grep -o '"styles"\|"assets"' /tmp/claude-graph.json | sort -u
```

Expected: в списке проектов появились `styles` и `assets`; в графе admin и client зависят от обоих.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/styles/project.json libs/shared/assets/project.json apps/admin/project.json apps/client/project.json
git commit -m "chore(monorepo): register shared styles and assets as nx projects"
```

---

### Task 3: Каркасы библиотек @eskhata/ui и @eskhata/data-access

**Files:**
- Create: `libs/shared/ui/project.json`, `libs/shared/ui/src/index.ts`, `libs/shared/ui/tsconfig.json`, `libs/shared/ui/tsconfig.lib.json`
- Create: `libs/shared/data-access/project.json`, `libs/shared/data-access/src/index.ts`, `libs/shared/data-access/tsconfig.json`, `libs/shared/data-access/tsconfig.lib.json`
- Modify: `tsconfig.base.json`, `apps/admin/tsconfig.json`, `apps/client/tsconfig.json` (paths)

**Interfaces:**
- Produces: import-пути `@eskhata/ui` и `@eskhata/data-access`, доступные обоим приложениям. Все последующие задачи кладут код в `libs/shared/ui/src/lib/<name>/` и `libs/shared/data-access/src/lib/<name>/` и реэкспортируют через `src/index.ts`.

- [ ] **Step 1: Сгенерировать библиотеки генератором Nx**

```bash
npx nx g @nx/angular:library ui --directory=libs/shared/ui --tags=scope:shared,type:shared --prefix=em --standalone --skip-tests --no-interactive
npx nx g @nx/angular:library data-access --directory=libs/shared/data-access --tags=scope:shared,type:shared --prefix=em --standalone --skip-tests --no-interactive
```

Если генератор создал демо-компонент/модуль внутри `src/lib` — удалить его, оставить пустой `src/index.ts` с комментарием `export {};`.

- [ ] **Step 2: Привести project.json к паттерну существующих библиотек**

Сверить с `libs/shared/util/project.json`: имя короткое (`ui`, `data-access`), prefix `em`, tags `["scope:shared", "type:shared"]`, target `lint` через `@nx/eslint:lint`. Исправить при расхождении.

- [ ] **Step 3: Прописать paths в трёх tsconfig**

В `tsconfig.base.json` добавить в `paths`:

```json
"@eskhata/ui": ["libs/shared/ui/src/index.ts"],
"@eskhata/data-access": ["libs/shared/data-access/src/index.ts"]
```

В `apps/admin/tsconfig.json` и `apps/client/tsconfig.json` добавить в `paths` (паттерн относительных путей — как у существующих @eskhata-алиасов):

```json
"@eskhata/ui": ["../../../libs/shared/ui/src/index.ts"],
"@eskhata/data-access": ["../../../libs/shared/data-access/src/index.ts"]
```

Внимание: в app-tsconfig относительный префикс должен совпадать с уже существующими строками `@eskhata/util` в том же файле — скопировать их форму.

- [ ] **Step 4: Верифицировать**

```bash
npx nx show projects | grep -E "^(ui|data-access)$"
npx nx run-many -t lint --projects=ui,data-access
npx nx run-many -t build --projects=admin,client
```

Expected: оба проекта видны, lint зелёный, приложения собираются.

- [ ] **Step 5: Commit**

```bash
git add libs/shared/ui libs/shared/data-access tsconfig.base.json apps/admin/tsconfig.json apps/client/tsconfig.json
git commit -m "feat(monorepo): scaffold @eskhata/ui and @eskhata/data-access libraries"
```

---

### Task 4: Перенос чистого кода core/ в @eskhata/util

Компоненты обоих приложений импортируют из `@core/` следующие **чистые** (без Angular-сервисов) модули. Их канонические версии переезжают в `libs/shared/util/src/lib/`.

**Files:**
- Modify: `libs/shared/util/src/index.ts` (реэкспорты)
- Create (в `libs/shared/util/src/lib/`): `interfaces/filter-params.interface.ts`, `interfaces/select.interface.ts`, `interfaces/table.interface.ts`, `interfaces/table1.interface.ts`, `interfaces/header.interface.ts`, `interfaces/message.interface.ts`, `interfaces/source.ts`, `interfaces/param.interface.ts`, `interfaces/multi-select.interface.ts`, `enums/table-status.enum.ts`, `enums/table.ts`, `enums/param.ts`, `enums/date-format.enum.ts`, `enums/action-enum.ts`, `constants/status-type.constants.ts`, `utils/filter-util.ts`, `utils/is-guid.ts`, `utils/zindexutils.ts`, `utils/uniquecomponentid.ts`, `utils/custom-validators.ts`, `helper.ts`
- Modify: файлы обоих приложений, импортирующие эти пути через `@core/…`
- Источники: `apps/{admin,client}/src/app/core/…` (соответствующие файлы; старые копии удаляются только когда на них не остаётся ссылок)

**Interfaces:**
- Consumes: alias `@eskhata/util` (существует).
- Produces: все перечисленные типы/функции экспортируются из `@eskhata/util` под своими текущими именами (например `IFilterParams`, `filterUtil`, `isGuid`, `UniqueComponentId`, `zindexutils` — точные имена взять из исходников при переносе, имена НЕ переименовывать).

- [ ] **Step 1: Для каждого файла сравнить копии admin/client**

```bash
cd /mnt/c/Projects/monorepo
for f in interfaces/filter-params.interface.ts interfaces/select.interface.ts interfaces/table.interface.ts interfaces/table1.interface.ts interfaces/header.interface.ts interfaces/message.interface.ts interfaces/source.ts interfaces/param.interface.ts interfaces/multi-select.interface.ts enums/table-status.enum.ts enums/table.ts enums/param.ts enums/date-format.enum.ts enums/action-enum.ts constants/status-type.constants.ts utils/filter-util.ts utils/is-guid.ts utils/zindexutils.ts utils/uniquecomponentid.ts utils/custom-validators.ts helper.ts; do
  echo "=== $f ==="
  diff "apps/admin/src/app/core/$f" "apps/client/src/app/core/$f" 2>&1 | head -40
done > /tmp/claude-1000/-mnt-c-Projects-monorepo/*/scratchpad/core-diffs.txt 2>/dev/null || true
```

Файл может существовать только в одном приложении — тогда его версия и есть каноническая. При расхождении: объединить (супермножество полей/веток), за основу — более полная/современная версия.

- [ ] **Step 2: Скопировать канонические версии в util**

Для каждого файла: скопировать в `libs/shared/util/src/lib/<та же подпапка>/`, внутри файла заменить внутренние `@core/...`-импорты на относительные (если оба файла переехали) — переносимые файлы не должны ссылаться назад на приложения.

- [ ] **Step 3: Реэкспортировать из index.ts**

В `libs/shared/util/src/index.ts` добавить строки вида (полный список — по фактически перенесённым файлам):

```ts
export * from './lib/interfaces/filter-params.interface';
export * from './lib/interfaces/select.interface';
export * from './lib/interfaces/table.interface';
export * from './lib/interfaces/table1.interface';
export * from './lib/interfaces/header.interface';
export * from './lib/interfaces/message.interface';
export * from './lib/interfaces/source';
export * from './lib/interfaces/param.interface';
export * from './lib/interfaces/multi-select.interface';
export * from './lib/enums/table-status.enum';
export * from './lib/enums/table';
export * from './lib/enums/param';
export * from './lib/enums/date-format.enum';
export * from './lib/enums/action-enum';
export * from './lib/constants/status-type.constants';
export * from './lib/utils/filter-util';
export * from './lib/utils/is-guid';
export * from './lib/utils/zindexutils';
export * from './lib/utils/uniquecomponentid';
export * from './lib/utils/custom-validators';
export * from './lib/helper';
```

При конфликте имён экспортов (одинаковое имя из двух файлов) — устранить в исходниках, не через `as`-переименование.

- [ ] **Step 4: Переключить импорты в обоих приложениях**

Для каждого перенесённого пути — во всех файлах приложений заменить `@core/<path>` на `@eskhata/util`. Пример для одного пути:

```bash
grep -rl "@core/utils/filter-util" apps | xargs sed -i "s|from '@core/utils/filter-util'|from '@eskhata/util'|g"
```

После замены объединить дублирующиеся import-строки из `@eskhata/util` в файлах, где их стало несколько (lint это подсветит).

- [ ] **Step 5: Удалить старые копии, на которые не осталось ссылок**

```bash
for f in <тот же список путей>; do
  for app in admin client; do
    p="apps/$app/src/app/core/$f"
    [ -f "$p" ] && ! grep -rq "core/${f%.ts}" apps/$app/src --include="*.ts" --exclude="$(basename $p)" && git rm -q "$p" || echo "KEEP $p (still referenced or absent)"
  done
done
```

Файлы, на которые остались ссылки из НЕ-общего кода приложения, тоже переключить на `@eskhata/util` и удалить копию — цель: ни одной копии перенесённого файла в `apps/`.

- [ ] **Step 6: Верифицировать и закоммитить**

```bash
npx nx run-many -t lint build test --projects=admin,client,util
git add -A libs/shared/util apps
git commit -m "refactor(monorepo): move pure core interfaces/enums/utils into @eskhata/util"
```

Expected: зелёно; `grep -r "from '@core/utils/filter-util'" apps` → пусто (и так для каждого перенесённого пути).

---

### Task 5: Перенос директив в @eskhata/util и DestroyableComponent в @eskhata/data-access

По спеке: чистые директивы → `util`; abstract-классы → `data-access`.

**Files:**
- Create (в `libs/shared/util/src/lib/`): `directives/click-outside/` (директива + module), `directives/select-trigger/` (из `selec-trigger` — папку при переносе переименовать в правильное написание, имена классов/селекторы НЕ менять), `directives/prime-template/`, `directives/tooltip.directive.ts`, `directives/infinite-scroll.directive.ts`, `directives/resize-column/`
- Create: `libs/shared/data-access/src/lib/abstract/destroyable.component.ts`
- Modify: `libs/shared/util/src/index.ts`, `libs/shared/data-access/src/index.ts`
- Modify: все файлы приложений, импортирующие эти пути

**Interfaces:**
- Consumes: каркасы библиотек (Task 3).
- Produces: из `@eskhata/util` экспортируются: `ClickOutsideModule`, директива select-trigger и её module, **`PrimeTemplateDirective`** (современное имя; admin-вариант `PrimeTemplate` умирает), tooltip-директива, infinite-scroll-директива, resize-column-директива. Из `@eskhata/data-access`: `DestroyableComponent`. Точные имена классов — из client-версий исходников.

- [ ] **Step 1: Сравнить копии и выбрать основу**

```bash
for d in directives/click-outside directives/selec-trigger directives/prime-template directives/tooltip.directive.ts directives/infinite-scroll.directive.ts directives/resize-column abstract/destroyable.component.ts; do
  echo "=== $d ==="; diff -ru "apps/admin/src/app/core/$d" "apps/client/src/app/core/$d" 2>&1 | head -30
done
```

Внимание: в client `destroyable.component` живёт в `core/directives/`, в admin — в `core/abstract/`. Каноническое место: `libs/shared/data-access/src/lib/abstract/`.

- [ ] **Step 2: Перенести канонические версии, поправить внутренние импорты**

Основа — client-версия (современный API). Фичи admin-версии (по diff) перенести. Импорты внутри перенесённых файлов: `@core/*` → `@eskhata/util` или относительные внутри util.

- [ ] **Step 3: Реэкспорт**

В `libs/shared/util/src/index.ts` добавить:

```ts
export * from './lib/directives/click-outside/click-outside.directive';
export * from './lib/directives/click-outside/click-outside.module';
export * from './lib/directives/select-trigger/select-trigger.directive';
export * from './lib/directives/select-trigger/select-trigger.module';
export * from './lib/directives/prime-template/prime-template';
export * from './lib/directives/tooltip.directive';
export * from './lib/directives/infinite-scroll.directive';
export * from './lib/directives/resize-column/resize-column.directive';
```

В `libs/shared/data-access/src/index.ts` добавить:

```ts
export * from './lib/abstract/destroyable.component';
```

(Имена файлов сверить с фактическими после переноса.)

- [ ] **Step 4: Переключить оба приложения на новые пути**

Импорты `@core/directives/click-outside/...`, `@core/directives/selec-trigger/...`, `@core/directives/prime-template/...`, `@core/directives/tooltip.directive`, `@core/directives/infinite-scroll.directive`, `@core/directives/resize-column/...` → `@eskhata/util`; `@core/abstract/destroyable.component` и `@core/directives/destroyable.component` → `@eskhata/data-access`. В admin дополнительно заменить класс `PrimeTemplate` на `PrimeTemplateDirective` во всех точках использования (imports-массивы компонентов; шаблоны не трогать — селектор не меняется).

- [ ] **Step 5: Удалить старые копии, верифицировать, закоммитить**

```bash
npx nx run-many -t lint build test --projects=admin,client,util,data-access
grep -rn "core/directives/click-outside\|core/directives/prime-template\|destroyable.component'" apps --include="*.ts" | grep -v node_modules
git add -A libs/shared/util libs/shared/data-access apps && git commit -m "refactor(monorepo): move shared directives to @eskhata/util, DestroyableComponent to @eskhata/data-access"
```

Expected: сборки зелёные; grep не находит старых импортов.

---

### Task 6: Перенос общих сервисов в @eskhata/data-access

**Files:**
- Create (в `libs/shared/data-access/src/lib/`): `services/message.service.ts`, `services/autocomplete.service.ts`, `services/helper.service.ts`, `services/data-source.service.ts`, `services/prime-ng-config.service.ts`, `services/multi-select.service.ts` (из `multi-seelct.service.ts` — файл при переносе переименовать, имя класса сохранить), `services/header.service.ts`
- Modify: `libs/shared/data-access/src/index.ts`
- Modify: файлы приложений с импортами этих сервисов

**Interfaces:**
- Consumes: `@eskhata/util` (типы), `@eskhata/environment`.
- Produces: из `@eskhata/data-access` экспортируются классы сервисов под текущими именами (`MessageService`, `AutocompleteService`, `HelperService`, `DataSourceService`, `HeaderService`, и т.д. — точные имена из исходников).

- [ ] **Step 1: Проверить транзитивные зависимости каждого сервиса**

```bash
for s in message.service autocomplete.service helper.service data-source.service prime-ng-config.service multi-seelct.service header.service; do
  echo "=== $s (client) ==="; grep -E "^import" "apps/client/src/app/core/services/$s.ts" 2>/dev/null
  echo "=== $s (admin) ==="; grep -E "^import" "apps/admin/src/app/core/services/$s.ts" 2>/dev/null
done
```

Правило: если сервис тянет app-специфичное (endpoints конкретного приложения, app-модели) — либо зависимость тоже общая и переносится в `util`/`data-access` этой же задачей, либо сервис параметризуется (InjectionToken со значением из приложения). Если сервис по сути app-специфичен — НЕ переносить, зафиксировать в коммите и вернуть в план заметкой; компоненты, зависящие от него, получат его через DI из приложения.

- [ ] **Step 2: Слить копии и перенести**

Diff admin/client-версий; основа — современная. Внутренние импорты: `@core/*` → `@eskhata/util` / относительные; `@environments/environment` → `@eskhata/environment`.

- [ ] **Step 3: Реэкспорт**

`libs/shared/data-access/src/index.ts`:

```ts
export * from './lib/services/message.service';
export * from './lib/services/autocomplete.service';
export * from './lib/services/helper.service';
export * from './lib/services/data-source.service';
export * from './lib/services/prime-ng-config.service';
export * from './lib/services/multi-select.service';
export * from './lib/services/header.service';
```

- [ ] **Step 4: Переключить импорты в приложениях, удалить старые копии**

`@core/services/<name>` → `@eskhata/data-access` во всех файлах обоих приложений; старые файлы удалить, когда ссылок не осталось.

- [ ] **Step 5: Верифицировать и закоммитить**

```bash
npx nx run-many -t lint build test --projects=admin,client,data-access
git add -A libs/shared/data-access apps && git commit -m "refactor(monorepo): move shared services into @eskhata/data-access"
```

---

## Волна 2 — извлечение компонентов

**Канонический процесс для КАЖДОГО компонента `C`** (повторяется в задачах 7–11; выполнять по одному компоненту, коммит на партию):

1. `diff -ru apps/admin/src/app/shared/components/C apps/client/src/app/shared/components/C` — изучить расхождения.
2. Скопировать современную версию (обычно client) в `libs/shared/ui/src/lib/C/` (компонент + шаблон + scss + вложенные interface/constants/services).
3. Портировать в неё фичи, существующие только во второй копии (инпуты, методы, куски шаблона). Спорные — отметить в сообщении коммита.
4. Импорты внутри перенесённых файлов: `@core/*` → `@eskhata/util`/`@eskhata/data-access`/`@eskhata/ui` (относительные внутри lib); `@environments/environment` → `@eskhata/environment`; ссылки на `@shared/*` — устранить (зависимость либо уже в ui, либо параметризуется через `<ng-content>`/`TemplateRef`).
5. Добавить реэкспорт в `libs/shared/ui/src/index.ts`: `export * from './lib/C/C.component';` (плюс module/interface, если есть).
6. В обоих приложениях заменить импорты `@shared/components/C/...` на `@eskhata/ui`; если у копий различались имена классов — привести все точки использования к каноническому имени.
7. Удалить обе старые папки `apps/{admin,client}/src/app/shared/components/C`; вычистить упоминания из `shared.module.ts`/`index.ts` приложений.
8. Проверить, что селектор остался прежним (шаблоны приложений не меняются), либо — если селекторы копий различались — обновить все шаблоны на канонический селектор: `grep -rn "<em-C\|<app-C" apps --include="*.html"`.

**Верификация каждой партии (задачи 7–11, последний шаг):**

```bash
npx nx run-many -t lint build test --projects=admin,client,ui
ls apps/admin/src/app/shared/components/ apps/client/src/app/shared/components/   # извлечённых папок нет
grep -rn "@shared/components/<each-C>" apps --include="*.ts" --include="*.html"   # пусто
```

В сообщении коммита перечислить экраны, где компоненты используются (`grep -rln "<selector" apps --include="*.html"`), — чек-лист ручной проверки для PR.

---

### Task 7: Партия A — toast, top-button, rating, breadcrumbs, password-input-rules

**Files:**
- Create: `libs/shared/ui/src/lib/{toast,top-button,rating,breadcrumbs,password-input-rules}/`
- Modify: `libs/shared/ui/src/index.ts`, файлы использования в обоих приложениях
- Delete: `apps/{admin,client}/src/app/shared/components/{toast,top-button,rating,breadcrumbs,password-input-rules}/`

**Interfaces:**
- Consumes: `PrimeTemplateDirective` из `@eskhata/util` (toast), `@eskhata/data-access` (MessageService для toast).
- Produces: `ToastComponent`/`ToastModule`, `TopButtonComponent`, `RatingComponent`, `BreadcrumbsComponent`, `PasswordInputRulesComponent` из `@eskhata/ui` (точные имена — из client-версий).

Известные расхождения: `toast` — admin на `EventEmitter`/`PrimeTemplate`, client на `output()`/`PrimeTemplateDirective`; основа — client, admin-only фичи перенести.

- [ ] **Step 1: toast — канонический процесс (шаги 1–8 выше)**
- [ ] **Step 2: top-button — канонический процесс**
- [ ] **Step 3: rating — канонический процесс**
- [ ] **Step 4: breadcrumbs — канонический процесс** (проверить зависимость от `xng-breadcrumb` — она в корневом package.json, ok)
- [ ] **Step 5: password-input-rules — канонический процесс**
- [ ] **Step 6: Верификация партии (блок выше) и commit**

```bash
git add -A libs/shared/ui apps
git commit -m "feat(ui): extract toast, top-button, rating, breadcrumbs, password-input-rules into @eskhata/ui"
```

---

### Task 8: Партия B — bottom-sheet, actions, message-card, validator, tab-view

**Files:**
- Create: `libs/shared/ui/src/lib/{bottom-sheet,actions,message-card,validator,tab-view}/`
- Modify: `libs/shared/ui/src/index.ts`, файлы использования
- Delete: соответствующие папки в обоих приложениях

**Interfaces:**
- Consumes: задачи 4–6 (`@eskhata/util`, `@eskhata/data-access`), `ClickOutsideModule` из `@eskhata/util`.
- Produces: `BottomSheetComponent` (его импортируют 5 будущих компонентов партий C/D), `ActionsComponent` + `action.interface.ts` (интерфейс экспортировать из ui), `MessageCardComponent`, `ValidatorComponent`, `TabViewComponent`.

Известные сцепки: admin `bottom-sheet` и `actions` импортируют `@shared/shared.module` — при переносе заменить на точечные импорты standalone-компонентов/модулей из ui; admin/client `message-card` — app-специфичные импорты, устранить по правилу 4 канонического процесса.

- [ ] **Step 1: bottom-sheet — канонический процесс** (первым: от него зависят другие)
- [ ] **Step 2: actions — канонический процесс** (вместе с `action.interface.ts`, реэкспорт из index.ts)
- [ ] **Step 3: message-card — канонический процесс**
- [ ] **Step 4: validator — канонический процесс**
- [ ] **Step 5: tab-view — канонический процесс**
- [ ] **Step 6: Верификация партии и commit**

```bash
git commit -m "feat(ui): extract bottom-sheet, actions, message-card, validator, tab-view into @eskhata/ui"
```

---

### Task 9: Партия C — quick-filter, custom-select-list, simple-select-list, multi-select-list, select-field-search

**Files:**
- Create: `libs/shared/ui/src/lib/{quick-filter,custom-select-list,simple-select-list,multi-select-list,select-field-search}/`
- Modify: `libs/shared/ui/src/index.ts`, файлы использования
- Delete: соответствующие папки в обоих приложениях

**Interfaces:**
- Consumes: `BottomSheetComponent` (Task 8), select-trigger директива (Task 5), `@eskhata/util` (select/filter-интерфейсы), `@eskhata/data-access`.
- Produces: `QuickFilterComponent`, `CustomSelectListComponent`, `SimpleSelectListComponent`, `MultiSelectListComponent`, `SelectFieldSearchComponent`.

Известные сцепки: admin `multi-select-list.module.ts` и `select-field-search` имеют app-специфичные импорты; client `select-field-search` импортирует client-лоадер — лоадер параметризовать (`<ng-content select="[loader]">` или `TemplateRef`-input c дефолтной простой заглушкой), app-лоадеры остаются в приложениях.

- [ ] **Step 1: quick-filter — канонический процесс**
- [ ] **Step 2: custom-select-list — канонический процесс**
- [ ] **Step 3: simple-select-list — канонический процесс**
- [ ] **Step 4: multi-select-list — канонический процесс**
- [ ] **Step 5: select-field-search — канонический процесс (+ параметризация лоадера)**
- [ ] **Step 6: Верификация партии и commit**

```bash
git commit -m "feat(ui): extract select-list family and quick-filter into @eskhata/ui"
```

---

### Task 10: Партия D — dropdown, multi-dropdown, multi-select, autocomplete, em-header

**Files:**
- Create: `libs/shared/ui/src/lib/{dropdown,multi-dropdown,multi-select,autocomplete,em-header}/`
- Modify: `libs/shared/ui/src/index.ts`, файлы использования
- Delete: соответствующие папки в обоих приложениях

**Interfaces:**
- Consumes: Task 5 (директивы), Task 6 (`AutocompleteService`, `HeaderService`), Task 8 (`BottomSheetComponent`), `@eskhata/environment` (dropdown, multi-dropdown используют environment).
- Produces: `DropdownComponent`, `MultiDropdownComponent`, `MultiSelectComponent`, `AutocompleteComponent`, `EmHeaderComponent`.

Известные сцепки: у всех пяти в обоих приложениях есть app-специфичные импорты (лоадеры, shared.module) — устранять по правилу 4; environment-импорты перевести на `@eskhata/environment`.

- [ ] **Step 1: dropdown — канонический процесс**
- [ ] **Step 2: multi-dropdown — канонический процесс**
- [ ] **Step 3: multi-select — канонический процесс**
- [ ] **Step 4: autocomplete — канонический процесс**
- [ ] **Step 5: em-header — канонический процесс**
- [ ] **Step 6: Верификация партии и commit**

```bash
git commit -m "feat(ui): extract dropdown family, autocomplete, em-header into @eskhata/ui"
```

---

### Task 11: Партия E — em-pagination, upload-field, map, table

**Files:**
- Create: `libs/shared/ui/src/lib/{em-pagination,upload-field,map,table}/`
- Modify: `libs/shared/ui/src/index.ts`, файлы использования
- Delete: соответствующие папки в обоих приложениях

**Interfaces:**
- Consumes: всё из задач 4–10 (table — самый составной: table.service, resize-column, filter-util, environment).
- Produces: `EmPaginationComponent`, `UploadFieldComponent` (+ `upload-field.interface.ts` — экспортировать), `MapComponent`, `TableComponent` (+ `table.constants.ts`, `table.service.ts` внутри lib).

Известные сцепки: `table` в обоих приложениях импортирует environment и app-лоадер (client) — лоадер параметризовать как в Task 9; `map` использует leaflet/mapbox (корневые зависимости, ok); `upload-field` в admin имеет app-специфичный импорт.

- [ ] **Step 1: em-pagination — канонический процесс**
- [ ] **Step 2: upload-field — канонический процесс**
- [ ] **Step 3: map — канонический процесс**
- [ ] **Step 4: table — канонический процесс** (table.service переезжает внутрь `libs/shared/ui/src/lib/table/services/`, его environment-импорт → `@eskhata/environment`)
- [ ] **Step 5: Верификация партии и commit**

```bash
git commit -m "feat(ui): extract em-pagination, upload-field, map, table into @eskhata/ui"
```

---

### Task 12: Вывод deprecated pagination из оборота

Старый `pagination` помечен `@Deprecated use em-pagination` — по спеке НЕ извлекается; точки использования переводятся на `em-pagination` из `@eskhata/ui`.

**Files:**
- Modify: все файлы приложений, использующие старый `pagination` (найти grep-ом)
- Delete: `apps/{admin,client}/src/app/shared/components/pagination/`

**Interfaces:**
- Consumes: `EmPaginationComponent` из `@eskhata/ui` (Task 11).
- Produces: в репозитории не остаётся ни одного использования старого pagination.

- [ ] **Step 1: Инвентаризация использований**

```bash
grep -rn "components/pagination/" apps --include="*.ts" | grep -v "em-pagination"
grep -rn "<app-pagination\|<pagination" apps --include="*.html"
```

Зафиксировать список файлов и сравнить API старого и нового компонентов (inputs/outputs) — составить таблицу соответствия.

- [ ] **Step 2: Мигрировать каждую точку использования на em-pagination**

Заменить импорт на `@eskhata/ui`, селектор и привязки — по таблице соответствия из Step 1. Если у старого pagination есть input/поведение, которого нет у em-pagination и которое реально используется — добавить его в `EmPaginationComponent` (в ui), а не сохранять старый компонент.

- [ ] **Step 3: Удалить старые папки pagination в обоих приложениях**

- [ ] **Step 4: Верифицировать и закоммитить**

```bash
npx nx run-many -t lint build test --projects=admin,client,ui
grep -rn "components/pagination" apps || echo OK
git add -A apps libs && git commit -m "refactor(monorepo): migrate deprecated pagination usages to em-pagination"
```

---

### Task 13: Финальная верификация и чистка

**Files:**
- Possibly modify: `apps/{admin,client}/src/app/shared/shared.module.ts`, `apps/{admin,client}/src/app/shared/index.ts` (остатки реэкспортов)

**Interfaces:**
- Consumes: результат всех задач.
- Produces: подтверждение целей спеки; список остаточных долгов для следующих итераций.

- [ ] **Step 1: Убедиться, что дублированных общих компонентов не осталось**

```bash
comm -12 <(ls apps/admin/src/app/shared/components | sort) <(ls apps/client/src/app/shared/components | sort)
```

Expected: пусто (остаются только app-специфичные компоненты, у них не должно быть тёзок во втором приложении).

- [ ] **Step 2: Проверить границы и граф**

```bash
npx nx run-many -t lint --all
npx nx graph --file=/tmp/claude-graph-final.json
```

Expected: lint зелёный (в т.ч. module-boundaries: ui/util/data-access не тянут app-код); в графе `ui` зависит только от `util`, `data-access`, `environment`.

- [ ] **Step 3: Полная сборка и тесты**

```bash
npx nx run-many -t build test --all
```

Expected: зелёно.

- [ ] **Step 4: Составить чек-лист ручной проверки**

Для финального PR собрать список всех экранов, где используются извлечённые компоненты:

```bash
for s in em-toast em-table em-header em-pagination; do echo "=== $s ==="; grep -rln "<$s" apps --include="*.html"; done
```

(Полный список селекторов — из `libs/shared/ui/src/index.ts`.) Вставить список в описание PR.

- [ ] **Step 5: Финальный commit**

```bash
git add -A && git commit -m "chore(monorepo): final cleanup after shared code extraction"
```

---

## Остаётся вне плана (из спеки, отдельные задачи)

- Типизация `Environment.api`.
- Чистка зависимостей (`uuid`/`uuidv4`, `print-js`/`print-js-updated`, `moment`, `prettier` 2.x, `--legacy-peer-deps`).
- Наполнение слоёв `page`/`widget`/`feature`.
