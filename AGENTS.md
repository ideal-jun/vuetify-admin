# Project Rules

## General

- Follow the existing code style and patterns.
- Prefer built-in component props/slots/APIs (Vuetify, Vue Router, VueUse, etc.) over hand-written implementations; only write custom code when the component or library has no built-in option.
- Treat RuoYi as the generic backend, not an adaptation target: keep service, type, router and documentation naming backend-generic, and do not add "RuoYi adapter" layers or RuoYi-specific code paths.
- Use pnpm for running project commands.
- Keep code in TypeScript unless migration is required.

## Stack

- Framework: Vue 3 + Vite
- UI Library: Vuetify
- Enabled Features: ESLint, Vuetify MCP, Pinia, Vue I18n, Vue Router, UnoCSS + Wind4
