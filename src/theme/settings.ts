/** Default theme settings */
export const themeSettings: App.Theme.ThemeSetting = {
  themeScheme: 'light',
  grayscale: false,
  colourWeakness: false,
  recommendColor: false,
  themeColor: '#646cff',
  themeRadius: 10,
  otherColor: {
    info: '#2080f0',
    success: '#18a058',
    warning: '#f0a020',
    error: '#d03050',
  },
  isInfoFollowPrimary: true,
  layout: {
    mode: 'vertical',
    scrollMode: 'content',
  },
  page: {
    animate: true,
    animateMode: 'fade-slide',
  },
  header: {
    height: 64,
    breadcrumb: {
      visible: true,
      showIcon: true,
    },
    multilingual: {
      visible: true,
    },
    globalSearch: {
      visible: true,
    },
  },
  tab: {
    visible: true,
    cache: true,
    height: 44,
    mode: 'chrome',
    closeTabByMiddleClick: false,
  },
  sider: {
    inverted: false,
    width: 248,
    collapsedWidth: 56,
    mixWidth: 92,
    mixCollapsedWidth: 76,
    mixChildMenuWidth: 208,
  },
  footer: {
    visible: true,
    height: 48,
    right: true,
  },
  watermark: {
    visible: false,
    text: 'Vuetify Admin',
    enableUserName: false,
    enableTime: false,
    timeFormat: 'YYYY-MM-DD HH:mm',
  },
  tokens: {
    light: {
      colors: {
        container: 'rgb(255, 255, 255)',
        layout: 'rgb(245, 247, 251)',
        inverted: 'rgb(15, 23, 42)',
        'base-text': 'rgb(31, 31, 31)',
      },
      boxShadow: {
        header: '0 1px 2px rgb(0, 21, 41, 0.08)',
        sider: '2px 0 8px 0 rgb(29, 35, 41, 0.05)',
        tab: '0 1px 2px rgb(0, 21, 41, 0.08)',
      },
    },
    dark: {
      colors: {
        container: 'rgb(30, 30, 34)',
        layout: 'rgb(18, 18, 22)',
        'base-text': 'rgb(224, 224, 224)',
      },
    },
  },
};

/**
 * Override theme settings
 *
 * When publishing a new version, use `overrideThemeSettings` to override certain theme settings for existing users.
 */
export const overrideThemeSettings: Partial<App.Theme.ThemeSetting> = {};
