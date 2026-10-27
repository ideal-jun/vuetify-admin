# vuetify-admin

A typed Vue 3 + Vuetify admin starter with a clean, layered architecture inspired by
[soybean-admin](https://github.com/soybeanjs/soybean-admin) and adapted to Vuetify 4, UnoCSS and a fetch-based service
layer. The default backend is [RuoYi-Cloud](https://gitee.com/y_project/RuoYi-Cloud); the frontend code stays
backend-generic.

## ✨ Features

- Vue 3 + Vite 8 + TypeScript 6 + Vuetify 4
- Backend integration (RuoYi-Cloud by default): captcha login, user/role/menu, dept/post/dict/config/notice, operation/login logs, online users, scheduled jobs, code generator, form builder and profile pages using the backend's native fields
- Dynamic routes, menus and tabs generated from backend `GET /system/menu/getRouters` (pages without a view render a placeholder)
- Typed service layer with flat `{ data, error }` responses
- Dynamic light / dark theme built from typed theme settings and CSS tokens
- Pinia setup stores with a `$reset` plugin
- Vue Router 5 route-key map, layout wrappers and typed route meta
- Vue I18n locale schema derived from the English messages
- Recursive sidebar menu with native Vuetify rail collapse and six layout modes
- Theme drawer, global search, tab bar with three styles, breadcrumb, watermark and presets
- Home dashboard composed from real backend counts
- Vitest unit, mapping, page and app-mount tests with stubbed services
- Oxlint + ESLint + Oxfmt with layer-boundary import rules

## 🧭 Demo account

The login page uses the backend gateway captcha:

| Account | Password   | Role    |
| ------- | ---------- | ------- |
| `admin` | `admin123` | `admin` |

The backend services must be running (see [`docs/backend.md`](docs/backend.md)).

## 🚀 Quick start

```bash
pnpm install
pnpm dev
```

`.env` contains the local backend defaults (gateway at `http://127.0.0.1:8888` through the Vite `/api` proxy).
Override machine-specific values in `.env.local` (git ignored); `.env.example` documents the full set.

```bash
pnpm build        # type-check + production build
pnpm preview      # preview the production build
pnpm check        # format check + lint + type-check + tests
pnpm test         # run the Vitest suite (services are stubbed, no backend needed)
pnpm test:coverage
pnpm test:e2e     # Playwright E2E; needs the backend on 8888 and Docker/Redis for the captcha
```

The E2E suite uses the installed Chrome channel and the real gateway. Start MySQL, Redis, Nacos and the RuoYi
gateway/auth/system/gen/job services first; the tests log in through `/api/auth/login` and read the captcha code from
the local Redis container.

## 📁 Project structure

```text
src/
├─ components/       advanced / common / custom components
├─ constants/        app, env, common constants and option records
├─ enum/             store ids
├─ hooks/            common (router, form, table, icon, boolean) and business hooks
├─ layouts/          base-layout, blank-layout and modules (header, menu, tab, search, theme-drawer)
├─ locales/          langs/en-us, langs/zh-cn, i18n entry and dayjs locale
├─ plugins/          vuetify, feedback, request, dayjs, loading, nprogress
├─ router/           route-key, elegant, routes and guard
├─ service/          api and request
├─ store/            app, auth, menu, route, tab and theme modules + reset plugin
├─ styles/           global, transitions, nprogress and Vuetify SCSS settings
├─ theme/            settings, tokens, breakpoints and json presets
├─ typings/          App / Api / CommonType / UnionKey ambient types
├─ utils/            color, storage, service, icon and common helpers
└─ views/            _builtin (403/404/500/login/iframe), home and system pages
```

## 🧱 Architecture notes

### Routing

`src/router/route-key.ts` holds the constant routes (root, home, login, error pages, iframe) and the three system pages;
route meta is typed in `src/typings/router.d.ts`.

The default `VITE_AUTH_ROUTE_MODE=dynamic` loads the signed-in user's menu tree from backend
`GET /system/menu/getRouters` after login. `src/router/dynamic.ts` transforms the tree into the elegant route
declarations consumed by the route store:

- `Layout` becomes the base layout wrapper; `ParentView` directories keep their nesting (three or more levels).
- `system/user|role|menu/index` map to the template views; the other backend pages are registered with the
  `unsupported` placeholder so the backend menu is complete.
- external links become `/external/...` routes with `meta.href` and open in a new tab.
- `hidden`, `noCache` and order are mapped to `hideInMenu`, `keepAlive` and menu ordering.

The static mode (`VITE_AUTH_ROUTE_MODE=static`) is still available for template development without a backend.

### Stores

- `app` — locale, mobile state, sider, reload flag and theme drawer
- `theme` — settings, CSS tokens, Vuetify theme sync and watermark
- `auth` — token, user info, roles, captcha login and logout
- `route` — constant/auth routes, menus, breadcrumbs, search menus and keep-alive cache
- `tab` — tabs, pinning and context-menu operations
- `menu` — the business menu tree loaded from `/system/menu/list`

### Service layer

`src/service/request/index.ts` returns a flat `{ data, error }` result instead of throwing. It supports backend
success/logout codes, authorization headers, 401 session handling and deduplicated error messages.

The service layer consumes the backend response shapes directly: flat `{ total, rows }` tables, status `0/1`, sex `0/1/2`,
permission codes such as `system:user:remove`, menu types `M/C/F` and the flat menu list. The request layer exposes
flat backend payloads as `data`, so the stores and views read the backend fields without an intermediate mapping layer.

Backend response codes (`VITE_SERVICE_SUCCESS_CODE`, `VITE_SERVICE_LOGOUT_CODES`, ...) are parsed and validated once
in `src/env.ts`, so a misconfigured environment fails at startup instead of silently turning successful responses into
errors. The service directory cannot import stores, components or router runtime code. Auth side effects are injected
with `setupRequestHandlers` from `src/plugins/request.ts`.

### Theme system

Theme settings are typed, persisted in production, copyable/resettable from the drawer, expanded into a 50–950 palette,
written to CSS variables and synchronized with Vuetify's theme instance, including the component border radius.
Presets live in `src/theme/preset/*.json`.

### File naming

Components use PascalCase, folders use kebab-case. Folder entry components use `index.vue`, which is explicitly
allowed by the linter. `src/views/_builtin` keeps soybean-admin's private-folder convention.

## 🔧 Configuration

The routing flags and backend service codes are validated in `src/env.ts` at startup. The committed `.env` contains
working local defaults; put machine-local overrides in `.env.local`.

| Variable                                | Description                                                        |
| --------------------------------------- | ------------------------------------------------------------------ |
| `VITE_APP_TITLE`                        | Application title (also injected into `index.html`)                |
| `VITE_APP_DESC`                         | Application description (injected into `index.html`)               |
| `VITE_BASE_URL`                         | Router base path                                                   |
| `VITE_ROUTER_HISTORY_MODE`              | `history`, `hash` or `memory`                                      |
| `VITE_AUTH_ROUTE_MODE`                  | `dynamic` (backend menu tree) or `static`                          |
| `VITE_ROUTE_HOME`                       | Home route key                                                     |
| `VITE_SERVICE_BASE_URL`                 | Backend base URL (proxied by the dev server)                       |
| `VITE_HTTP_PROXY` / `VITE_PROXY_TARGET` | Proxy `/api` to the gateway in development                         |
| `VITE_SERVICE_SUCCESS_CODE`             | Backend success code (`200` for backend)                           |
| `VITE_SERVICE_LOGOUT_CODES`             | Codes that force a logout                                          |
| `VITE_SERVICE_MODAL_LOGOUT_CODES`       | Codes that show a logout confirmation modal                        |
| `VITE_SERVICE_EXPIRED_TOKEN_CODES`      | Codes that trigger a token refresh                                 |
| `VITE_STATIC_SUPER_ROLE`                | Super role that bypasses role checks (static route mode)           |
| `VITE_STORAGE_PREFIX`                   | Prefix for local/session storage keys                              |
| `VITE_DEFAULT_USER_PASSWORD`            | Initial password used by the create-user form (default `admin123`) |

The backend response shape expected by the request layer is:

```ts
{
  code: 200;
  msg: string;
  data: T;
}
```

## 🐘 backend

Start the backend services (Nacos, MySQL, Redis, gateway, auth and system), then run `pnpm dev` and log in with
`admin` / `admin123`. The login form shows the gateway captcha; the sidebar, breadcrumb and tabs are generated from
`/system/menu/getRouters`, and the system pages call the backend `/system/*` APIs.

The gateway is expected on `127.0.0.1:8888` because the Nacos console uses `8080`; change
`VITE_PROXY_TARGET` / `VITE_SERVICE_BASE_URL` if your layout differs.

See [`docs/backend.md`](docs/backend.md) for the full backend setup, the API mapping table and the known
limitations (static routes, unsupported filters, role user counts, default create values).

## 🧪 Tests

The suite covers environment validation, color/storage utilities, the menu store, tab helpers, route transformation,
layout menu mapping, button permissions, the Vuetify locale adapter, the backend menu-tree transformer (`getRouters`),
page-level tests for user, role and menu management (backend response fixtures under `src/test/fixtures/backend/`) and an
app-mount integration test that also navigates the dynamic routes. Service modules are stubbed in tests, so the suite
runs without a backend.

## ✅ Quality gate

`pnpm check` runs the Oxfmt format check, Oxlint + ESLint, `vue-tsc` and Vitest. Line endings are enforced as LF by
`.gitattributes`, so Windows checkouts do not need extra configuration.

## 📄 License

MIT
