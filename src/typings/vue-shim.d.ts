/**
 * WebStorm's TypeScript service does not resolve .vue modules in .ts files
 * without this fallback. vue-tsc/Volar still uses the real SFC types.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent;
  export default component;
}
