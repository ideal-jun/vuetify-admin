import type { I18n } from 'vue-i18n';
import { useI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';

import i18n from '@/locales';
import { createVuetifyTheme } from '@/store/modules/theme/shared';
import { forVuetify } from '@/theme/breakpoints';
import { themeSettings } from '@/theme/settings';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

const themeColors: App.Theme.ThemeColor = {
  primary: themeSettings.themeColor,
  ...themeSettings.otherColor,
  info: themeSettings.isInfoFollowPrimary
    ? themeSettings.themeColor
    : themeSettings.otherColor.info,
};

const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n: i18n as unknown as I18n, useI18n }),
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: createVuetifyTheme(themeColors, false),
      dark: createVuetifyTheme(themeColors, true),
    },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: forVuetify,
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
    },
    VCard: {
      rounded: 'xl',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
  },
});

export default vuetify;
