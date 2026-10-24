import { config } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { vi } from 'vitest';
import { createApp } from 'vue';
import * as VuetifyComponents from 'vuetify/components';

import i18n from '@/locales';
import vuetify from '@/plugins/vuetify';
import { resetSetupStore } from '@/store/plugins';

const pinia = createPinia();

pinia.use(resetSetupStore);

// Vue Test Utils installs the pinia plugin on every mount, but some tests create
// stores before mounting, so the pending plugins are installed right away.
createApp({}).use(pinia);

export { pinia };

config.global.plugins = [i18n, vuetify, pinia];
config.global.components = { ...VuetifyComponents };

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {
    // noop
  }

  unobserve() {
    // noop
  }

  disconnect() {
    // noop
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});
