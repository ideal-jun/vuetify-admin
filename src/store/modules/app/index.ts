import { breakpointsTailwind, useBreakpoints, useEventListener } from '@vueuse/core';
import { defineStore } from 'pinia';
import { effectScope, nextTick, onScopeDispose, ref, watch } from 'vue';

import { SetupStoreId } from '@/enum';
import { useBoolean } from '@/hooks/common/boolean';
import { $t, setLocale } from '@/locales';
import { setDayjsLocale } from '@/locales/dayjs';
import { router } from '@/router';
import { localStg } from '@/utils/storage';

import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { useThemeStore } from '../theme';

export const useAppStore = defineStore(SetupStoreId.App, () => {
  const themeStore = useThemeStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const scope = effectScope();
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const {
    bool: themeDrawerVisible,
    setTrue: openThemeDrawer,
    setFalse: closeThemeDrawer,
  } = useBoolean();

  const { bool: reloadFlag, setBool: setReloadFlag } = useBoolean(true);

  const { bool: fullContent, toggle: toggleFullContent } = useBoolean();

  const {
    bool: siderCollapse,
    setBool: setSiderCollapse,
    toggle: toggleSiderCollapse,
  } = useBoolean(localStg.get('siderCollapse') === 'Y');

  /** Is mobile layout */
  const isMobile = breakpoints.smaller('sm');

  /**
   * Reload the page
   *
   * @param duration Duration time
   */
  async function reloadPage(duration = 300) {
    setReloadFlag(false);

    const d = themeStore.page.animate ? duration : 40;

    await new Promise((resolve) => {
      setTimeout(resolve, d);
    });

    setReloadFlag(true);
    routeStore.resetRouteCache();
  }

  const locale = ref<App.I18n.LangType>(localStg.get('lang') || 'zh-CN');

  const localeOptions: App.I18n.LangOption[] = [
    {
      label: '中文',
      key: 'zh-CN',
    },
    {
      label: 'English',
      key: 'en-US',
    },
  ];

  function changeLocale(lang: App.I18n.LangType) {
    locale.value = lang;
    setLocale(lang);
    localStg.set('lang', lang);
  }

  /** Update the document title by locale */
  function updateDocumentTitleByLocale() {
    const { i18nKey, title } = router.currentRoute.value.meta;

    const documentTitle = i18nKey ? $t(i18nKey) : title;

    document.title = documentTitle
      ? `${documentTitle} · ${$t('system.title')}`
      : $t('system.title');
  }

  function init() {
    setDayjsLocale(locale.value);

    document.querySelector('html')?.setAttribute('lang', locale.value);
  }

  // Watch store
  scope.run(() => {
    // Watch isMobile, if it is mobile, collapse the sider
    watch(
      isMobile,
      (newValue) => {
        if (newValue) {
          // Backup the theme setting before it becomes mobile
          localStg.set('backupThemeSettingBeforeIsMobile', {
            layout: themeStore.layout.mode,
            siderCollapse: siderCollapse.value,
          });

          themeStore.setThemeLayout('vertical');
          setSiderCollapse(true);
        } else {
          // When it is not mobile, recover the backup theme setting
          const backup = localStg.get('backupThemeSettingBeforeIsMobile');

          if (backup) {
            nextTick(() => {
              themeStore.setThemeLayout(backup.layout);
              setSiderCollapse(backup.siderCollapse);

              localStg.remove('backupThemeSettingBeforeIsMobile');
            });
          }
        }
      },
      { immediate: true },
    );

    // Watch locale
    watch(locale, () => {
      updateDocumentTitleByLocale();

      routeStore.updateGlobalMenusByLocale();

      tabStore.updateTabsByLocale();

      setDayjsLocale(locale.value);
    });
  });

  // Cache the sider state
  useEventListener(window, 'beforeunload', () => {
    localStg.set('siderCollapse', siderCollapse.value ? 'Y' : 'N');
  });

  // On scope dispose
  onScopeDispose(() => {
    scope.stop();
  });

  // Init
  init();

  return {
    isMobile,
    reloadFlag,
    reloadPage,
    fullContent,
    toggleFullContent,
    locale,
    localeOptions,
    changeLocale,
    updateDocumentTitleByLocale,
    themeDrawerVisible,
    openThemeDrawer,
    closeThemeDrawer,
    siderCollapse,
    setSiderCollapse,
    toggleSiderCollapse,
  };
});
