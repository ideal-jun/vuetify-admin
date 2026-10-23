import type { App } from 'vue';

declare module 'vue-i18n' {
  // Define the locale message schema
  export interface DefineLocaleMessage extends App.I18n.Schema {}
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: App.I18n.$T;
  }
}

export {};
