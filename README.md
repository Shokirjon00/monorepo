# MyMfWorkspace (Eskhata)

Nx-монорепозиторий на Angular 20, объединяющий два приложения — `admin` и `client` — с общими библиотеками.

---

## 1. Принятый метод разработки

**Монорепозиторий (Monorepo) на Nx** — все приложения и библиотеки живут в одном репозитории, с единым `package.json`, единой версией Angular и общим графом зависимостей.

Ключевые принципы, принятые в проекте:

| Принцип | Как реализовано |
|---|---|
| Единый репозиторий | `apps/*` + `libs/*`, один lock-файл, одна версия зависимостей |
| Переиспользование кода | Общий код выносится в `libs/`, импортируется по алиасам `@eskhata/*` |
| Изоляция приложений | `admin` и `client` **никогда** не импортируют друг друга — только через `scope:shared` |
| Инкрементальность | Nx-кэш + `nx affected` — собирается/тестируется только затронутое |
| Автоматический контроль архитектуры | ESLint-правило `@nx/enforce-module-boundaries` (см. `eslint.config.mjs`) |
| Удалённый кэш | Nx Cloud (`nxCloudId` в `nx.json`), общий кэш между разработчиками и CI |

Инструменты: **Angular 20** (`@angular/build:application`, esbuild), **Jest** — юнит-тесты, **Playwright** — e2e, **ESLint (flat config)** + **Prettier**.

---

## 2. Используемая архитектура — FSD (Feature-Sliced Design) поверх Nx

Архитектура строится на **двух независимых осях тегов**. Каждый проект обязан иметь **ровно два тега** в своём `project.json`.

### Ось 1 — `scope` (изоляция приложений)

| Тег | Может зависеть от |
|---|---|
| `scope:shared` | `scope:shared` |
| `scope:admin` | `scope:admin`, `scope:shared` |
| `scope:client` | `scope:client`, `scope:shared` |

> `admin` и `client` не видят код друг друга. Если код нужен обоим — он переезжает в `scope:shared`.

### Ось 2 — `type` (слой FSD, зависимости только вниз)

```
type:app  →  type:page  →  type:widget  →  type:feature  →  type:entity  →  type:shared
```

Каждый слой может импортировать **только** слои строго ниже себя. Импорт вверх запрещён и падает на `nx lint`.

| Слой | Что размещаем |
|---|---|
| `type:app` | Само приложение: роутинг, bootstrap, провайдеры |
| `type:page` | Страница-маршрут |
| `type:widget` | Составной UI-блок (шапка, сайдбар, таблица с фильтрами) |
| `type:feature` | Пользовательское действие (login, create-order) |
| `type:entity` | Бизнес-сущность (user, session, order) — модель + API + стор |
| `type:shared` | Универсальное: ui-kit, утилиты, конфиг, базовый API, стили, ассеты |

### Текущая структура

```
my-mf-workspace/
├─ apps/
│  ├─ admin/                 scope:admin  · type:app
│  └─ client/                scope:client · type:app
├─ libs/
│  ├─ entities/
│  │  └─ session/            scope:shared · type:entity   → @eskhata/session
│  └─ shared/
│     ├─ util/               scope:shared · type:shared   → @eskhata/util
│     ├─ environment/        scope:shared · type:shared   → @eskhata/environment
│     ├─ styles/             общие SCSS (font.scss, core/)
│     └─ assets/             общие иконки, шрифты, изображения
├─ nx.json                   конфигурация Nx, targetDefaults, плагины
├─ tsconfig.base.json        алиасы @eskhata/* (только общие библиотеки!)
└─ eslint.config.mjs         правила границ модулей
```

### Правила при создании новой библиотеки

1. Определить `scope`: используется обоими приложениями → `scope:shared`; только одним → `scope:admin` / `scope:client`.
2. Определить `type` по таблице слоёв выше.
3. Прописать оба тега в `libs/.../project.json` → `"tags": ["scope:shared", "type:entity"]`.
4. Алиас добавлять в **корневой** `tsconfig.base.json` — **только для настоящих общих библиотек**.

> ⚠️ **Важно:** правило границ модулей резолвит алиасы **только** через корневой `tsconfig.base.json`. Пути из per-app `tsconfig.json` (`@core`, `@shared`, `@modules`, `@environments`) для него невидимы — они остаются внутри приложений.

---

## 3. Команды Nx

### Установка

```sh
npm install
```

### Запуск (dev)

```sh
npm run start:admin        # admin  → http://localhost:4200
npm run start:client       # client → http://localhost:4201
npm run start:dev          # оба приложения параллельно

nx serve admin --port=4200
nx serve client --port=4201
```

### Сборка

```sh
npm run build:admin        # nx build admin --configuration=production
npm run build:client
npm run build:all          # nx run-many --target=build --all

nx build admin --configuration=production
nx build admin --configuration=development
```

### Линтинг

```sh
npm run lint               # nx run-many -t lint
nx lint admin
nx lint client
nx lint session
nx run-many -t lint --projects=admin,client
nx lint admin --fix
```

### Тесты

```sh
npm test                   # nx run-many -t test
nx test admin
nx test admin --watch
nx test admin --coverage
nx test admin --configuration=ci
nx e2e admin-e2e           # Playwright
```

### Affected — только затронутые изменениями проекты (для CI)

```sh
nx affected -t build
nx affected -t lint
nx affected -t test
nx affected -t lint,test,build

nx affected -t build --base=master --head=HEAD
nx affected --graph                 # граф только затронутых проектов
nx show projects --affected         # список затронутых проектов
```

### Граф зависимостей и инспекция

```sh
nx graph                            # интерактивный граф в браузере
nx graph --focus=admin              # граф вокруг одного проекта
nx graph --file=graph.json          # выгрузить граф в файл
nx show projects                    # все проекты воркспейса
nx show project admin               # конфигурация и targets проекта
nx show project admin --web
```

### Генерация кода

```sh
# Библиотека (после генерации ОБЯЗАТЕЛЬНО проставить теги в project.json)
nx g @nx/angular:library --name=order --directory=libs/entities/order

# Приложение
nx g @nx/angular:application --name=my-app --directory=apps/my-app

# Компонент / сервис внутри проекта
nx g @nx/angular:component --name=user-card --project=session
nx g @nx/angular:service   --name=session    --project=session

# Предпросмотр без записи на диск
nx g @nx/angular:library --name=order --dry-run
```

### Перемещение и удаление проектов

```sh
nx g @nx/workspace:move --project=order --destination=libs/features/order
nx g @nx/workspace:remove --project=order
```

### Кэш и обслуживание

```sh
nx reset                            # очистить локальный кэш и остановить демон
nx build admin --skip-nx-cache      # сборка в обход кэша
nx daemon --stop
nx repair                           # починить конфиги после обновлений
nx migrate latest                   # обновить Nx и зависимости
nx migrate --run-migrations
nx list                             # установленные плагины
nx list @nx/angular                 # генераторы конкретного плагина
```

### Параллельный запуск

```sh
nx run-many -t build --all
nx run-many -t build --projects=admin,client
nx run-many -t lint --parallel=3
```

---

## 4. CI

GitHub Actions (`.github/workflows/`) использует `nx affected` — на PR прогоняются lint/test/build только для затронутых проектов. Удалённый кэш Nx Cloud переиспользуется между локальными запусками и CI.
