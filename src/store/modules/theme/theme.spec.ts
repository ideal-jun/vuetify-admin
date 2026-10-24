import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import vuetify from '@/plugins/vuetify';
import { themeSettings } from '@/theme/settings';

import { useThemeStore } from './index';
import { createVuetifyTheme } from './shared';

const colors: App.Theme.ThemeColor = {
  primary: '#646cff',
  info: '#646cff',
  success: '#18a058',
  warning: '#f0a020',
  error: '#d03050',
};

describe('theme radius', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('creates a Vuetify theme with the configured border radius', () => {
    const theme = createVuetifyTheme(colors, false, 6);

    expect(theme.variables['border-radius-root']).toBe('6px');
  });

  it('uses the default theme radius when no radius is passed', () => {
    const theme = createVuetifyTheme(colors, true);

    expect(theme.variables['border-radius-root']).toBe(`${themeSettings.themeRadius}px`);
  });

  it('syncs a new radius to the light and dark Vuetify themes', async () => {
    const themeStore = useThemeStore();

    themeStore.setThemeRadius(6);

    await nextTick();

    expect(vuetify.theme.themes.value.light?.variables['border-radius-root']).toBe('6px');
    expect(vuetify.theme.themes.value.dark?.variables['border-radius-root']).toBe('6px');
    // The generated Vuetify stylesheet is what component CSS reads at runtime.
    expect(vuetify.theme.styles.value).toContain('--v-border-radius-root: 6px');
  });

  it('syncs the radius of an applied preset', async () => {
    const themeStore = useThemeStore();

    themeStore.applySettings({ themeRadius: 14 });

    await nextTick();

    expect(themeStore.themeRadius).toBe(14);
    expect(vuetify.theme.themes.value.light?.variables['border-radius-root']).toBe('14px');
    expect(vuetify.theme.themes.value.dark?.variables['border-radius-root']).toBe('14px');
    expect(vuetify.theme.styles.value).toContain('--v-border-radius-root: 14px');
  });
});
