# vuetify-admin

A typed Vue 3 + Vuetify admin starter with a clean, layered architecture inspired by
[soybean-admin](https://github.com/soybeanjs/soybean-admin) and adapted to Vuetify 4, UnoCSS and a fetch-based service layer.

## ✨ Features

- Vue 3 + Vite 8 + TypeScript 6 + Vuetify 4
- Dynamic light / dark theme built from typed theme settings and CSS tokens
- Pinia setup stores with a `$reset` plugin
- Vue Router 5 route-key map, layout wrappers and typed route meta
- Vue I18n locale schema derived from the English messages
- Typed service layer with flat `{ data, error }` responses and a built-in mock backend
- Password and phone-code login, remember-me, password reset request and button-level permissions
- Recursive sidebar menu with native Vuetify rail collapse and six layout modes
- Theme drawer, global search, tab bar with three styles, breadcrumb, watermark and presets
- Home dashboard loaded from a `/home/overview` service endpoint
- Vitest unit tests plus full app-mount integration tests
- Oxlint + ESLint + Oxfmt with layer-boundary import rules

## 🧭 Demo accounts

The mock service is enabled by default (`VITE_SERVICE_MOCK=Y`), so no backend is required.

| Account   | Password | Phone         | Roles                | Button permissions                     |
| --------- | -------- | ------------- | -------------------- | -------------------------------------- |
| `admin`   | `123456` | `13800000001` | `R_SUPER`, `R_ADMIN` | `*`                                    |
| `Soybean` | `123456` | `13800000002` | `R_ADMIN`            | user/menu view + add + edit, no delete |
| `User`    | `123456` | `13800000003` | `R_USER`             | menu view                              |

Phone-code login uses the demo code `123456`. The code must be requested first from the login page.

The home page is a constant route. System pages require login and are filtered by role.

## 🚀 Quick start

```bash
pnpm install
pnpm dev
```

```bash
pnpm build        # type-check + production build
pnpm preview      # preview the production build
pnpm check        # format check + lint + type-check + tests
pnpm test         # run the Vitest suite
pnpm test:coverage
```

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
├─ service/          api, mock and request
├─ store/            app, auth, menu, route, tab and theme modules + reset plugin
├─ styles/           reset, global, transitions, nprogress and Vuetify SCSS settings
├─ theme/            settings, tokens, breakpoints and json presets
├─ typings/          App / Api / CommonType / UnionKey ambient types
├─ utils/            color, storage, service, icon and common helpers
└─ views/            _builtin (403/404/500/login/iframe), home and system pages
```

## 🧱 Architecture notes

### Route keys

`src/router/route-key.ts` is the single source of truth for route names and paths. Route meta is typed in
`src/typings/router.d.ts` (i18n key, roles, keep-alive, icon, tab options, ...).

`src/router/elegant/` follows elegant-router's shape: routes declare component strings such as
`layout.base$view.home` and `transform.ts` resolves them to real lazy components.

### Stores

- `app` — locale, mobile state, sider, reload flag and theme drawer
- `theme` — settings, CSS tokens, Vuetify theme sync and watermark
- `auth` — token, user info, roles, login and refresh
- `route` — constant/auth routes, menus, breadcrumbs, search menus and keep-alive cache
- `tab` — tabs, pinning and context-menu operations
- `menu` — the business menu tree used by menu management

### Service layer

`src/service/request/index.ts` returns a flat `{ data, error }` result instead of throwing. It supports backend
success/logout/refresh codes, authorization headers, a single-flight refresh flow, deduplicated error messages and a
complete mock backend for auth, routes, the home overview and user/role/menu management.

The service directory cannot import stores or components. Auth side effects are injected with
`setupRequestHandlers` from `src/plugins/request.ts`.

### Theme system

Theme settings are typed, persisted in production, copyable/resettable from the drawer, expanded into a 50–950 palette,
written to CSS variables and synchronized with Vuetify's theme instance. Presets live in `src/theme/preset/*.json`.

### File naming

Components use PascalCase, folders use kebab-case. Folder entry components use `index.vue`, which is explicitly
allowed by the linter. `src/views/_builtin` keeps soybean-admin's private-folder convention.

## 🔧 Configuration

| Variable                           | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| `VITE_APP_TITLE`                   | Application title                            |
| `VITE_ROUTER_HISTORY_MODE`         | `history`, `hash` or `memory`                |
| `VITE_AUTH_ROUTE_MODE`             | `static` or `dynamic`                        |
| `VITE_ROUTE_HOME`                  | Home route key                               |
| `VITE_SERVICE_BASE_URL`            | Backend base URL                             |
| `VITE_SERVICE_MOCK`                | `Y` for the mock backend, `N` for a real API |
| `VITE_SERVICE_SUCCESS_CODE`        | Backend success code                         |
| `VITE_SERVICE_LOGOUT_CODES`        | Codes that force a logout                    |
| `VITE_SERVICE_EXPIRED_TOKEN_CODES` | Codes that trigger a token refresh           |
| `VITE_STORAGE_PREFIX`              | Prefix for local/session storage keys        |

To use a real backend, set `VITE_SERVICE_MOCK=N` and implement the endpoints under `src/service/api/`. The expected
response shape is:

```ts
{
  code: '0000';
  msg: string;
  data: T;
}
```

## 🧪 Tests

The suite covers environment validation, color/storage utilities, menu and route stores, route transformation, tab
helpers, layout menu mapping, button permissions, home data hydration, the mock backend and an app mount of the home page.

## 📄 License

MIT
