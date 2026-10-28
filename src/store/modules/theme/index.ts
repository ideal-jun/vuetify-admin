import { useDateFormat, useEventListener, useNow, usePreferredColorScheme } from '@vueuse/core';
import { defu } from 'defu';
import { defineStore } from 'pinia';
import { computed, effectScope, onScopeDispose, ref, toRefs, watch } from 'vue';
import type { Ref } from 'vue';

import { SetupStoreId } from '@/enum';
import vuetify from '@/plugins/vuetify';
import { getPaletteColorByNumber } from '@/utils/color';
import { localStg } from '@/utils/storage';

import { useAuthStore } from '../auth';
import {
  addThemeVarsToGlobal,
  createThemeToken,
  createVuetifyThemeColors,
  initThemeSettings,
  toggleAuxiliaryColorModes,
  toggleCssDarkMode,
} from './shared';

/** Theme store */
export const useThemeStore = defineStore(SetupStoreId.Theme, () => {
  const scope = effectScope();
  const osTheme = usePreferredColorScheme();

  /** Theme settings */
  const settings: Ref<App.Theme.ThemeSetting> = ref(initThemeSettings());

  /** Watermark time instance with controls */
  const {
    now: watermarkTime,
    pause: pauseWatermarkTime,
    resume: resumeWatermarkTime,
  } = useNow({ controls: true });

  /** Dark mode */
  const darkMode = computed(() => {
    if (settings.value.themeScheme === 'auto') {
      return osTheme.value === 'dark';
    }

    return settings.value.themeScheme === 'dark';
  });

  /** Grayscale mode */
  const grayscaleMode = computed(() => settings.value.grayscale);

  /** Colour weakness mode */
  const colourWeaknessMode = computed(() => settings.value.colourWeakness);

  /** Theme colors */
  const themeColors = computed(() => {
    const { themeColor, otherColor, isInfoFollowPrimary } = settings.value;

    const colors: App.Theme.ThemeColor = {
      primary: themeColor,
      ...otherColor,
      info: isInfoFollowPrimary ? themeColor : otherColor.info,
    };

    return colors;
  });

  /** The settings json, it is used to copy the settings */
  const settingsJson = computed(() => JSON.stringify(settings.value));

  /** Watermark time formatter */
  const formattedWatermarkTime = useDateFormat(
    watermarkTime,
    () => settings.value.watermark.timeFormat,
  );

  /** Watermark content */
  const watermarkContent = computed(() => {
    const { watermark } = settings.value;

    if (watermark.enableUserName) {
      const { userInfo } = useAuthStore();
      const userName = userInfo.user.nickName || userInfo.user.userName;

      if (userName) {
        return userName;
      }
    }

    if (watermark.enableTime) {
      return formattedWatermarkTime.value;
    }

    return watermark.text;
  });

  /** Sync the Vuetify theme with the current theme settings */
  function syncVuetifyTheme() {
    const mode = darkMode.value ? 'dark' : 'light';
    const radius = `${settings.value.themeRadius}px`;

    // The radius is not theme specific, keep both themes ready for a scheme switch.
    for (const themeName of ['light', 'dark'] as const) {
      const theme = vuetify.theme.themes.value[themeName];

      if (theme) {
        theme.variables['border-radius-root'] = radius;
      }
    }

    const theme = vuetify.theme.themes.value[mode];

    if (theme) {
      Object.assign(theme.colors, createVuetifyThemeColors(themeColors.value, mode === 'dark'));
    }

    void vuetify.theme.change(mode);
  }

  /** Setup theme vars to global */
  function setupThemeVarsToGlobal() {
    const { themeTokens, darkThemeTokens } = createThemeToken(
      themeColors.value,
      settings.value.tokens,
      settings.value.recommendColor,
    );

    addThemeVarsToGlobal(themeTokens, darkThemeTokens);
  }

  /** Reset the store */
  function resetStore() {
    const themeStore = useThemeStore();

    themeStore.$reset();

    localStg.remove('themeSettings');
  }

  /**
   * Apply a partial theme setting
   *
   * @param patch The partial settings
   */
  function applySettings(patch: Partial<App.Theme.ThemeSetting>) {
    const merged = defu(patch, settings.value);

    Object.assign(settings.value, merged);
  }

  /**
   * Set the theme scheme
   *
   * @param themeScheme
   */
  function setThemeScheme(themeScheme: UnionKey.ThemeScheme) {
    settings.value.themeScheme = themeScheme;
  }

  /**
   * Set the grayscale value
   *
   * @param isGrayscale
   */
  function setGrayscale(isGrayscale: boolean) {
    settings.value.grayscale = isGrayscale;
  }

  /**
   * Set the colour weakness value
   *
   * @param isColourWeakness
   */
  function setColourWeakness(isColourWeakness: boolean) {
    settings.value.colourWeakness = isColourWeakness;
  }

  /** Toggle the theme scheme */
  function toggleThemeScheme() {
    const themeSchemes: UnionKey.ThemeScheme[] = ['light', 'dark', 'auto'];

    const index = themeSchemes.indexOf(settings.value.themeScheme);

    const nextIndex = index === themeSchemes.length - 1 ? 0 : index + 1;

    const nextThemeScheme = themeSchemes[nextIndex] ?? 'light';

    setThemeScheme(nextThemeScheme);
  }

  /**
   * Update theme colors
   *
   * @param key Theme color key
   * @param color Theme color
   */
  function updateThemeColors(key: App.Theme.ThemeColorKey, color: string) {
    let colorValue = color;

    if (settings.value.recommendColor) {
      colorValue = getPaletteColorByNumber(color, 500, true);
    }

    if (key === 'primary') {
      settings.value.themeColor = colorValue;
    } else {
      settings.value.otherColor[key] = colorValue;
    }
  }

  /**
   * Set the theme layout
   *
   * @param mode Theme layout mode
   */
  function setThemeLayout(mode: UnionKey.ThemeLayoutMode) {
    settings.value.layout.mode = mode;
  }

  /**
   * Set the theme radius
   *
   * @param radius
   */
  function setThemeRadius(radius: number) {
    settings.value.themeRadius = radius;
  }

  /**
   * Set watermark enable user name
   *
   * @param enable Whether to enable the user name watermark
   */
  function setWatermarkEnableUserName(enable: boolean) {
    settings.value.watermark.enableUserName = enable;

    if (enable) {
      settings.value.watermark.enableTime = false;
    }
  }

  /**
   * Set watermark enable time
   *
   * @param enable Whether to enable the time watermark
   */
  function setWatermarkEnableTime(enable: boolean) {
    settings.value.watermark.enableTime = enable;

    if (enable) {
      settings.value.watermark.enableUserName = false;
    }
  }

  /** Only run the timer when the watermark is visible and the time display is enabled */
  function updateWatermarkTimer() {
    const { watermark } = settings.value;
    const shouldRunTimer = watermark.visible && watermark.enableTime;

    if (shouldRunTimer) {
      resumeWatermarkTime();
    } else {
      pauseWatermarkTime();
    }
  }

  /** Cache the theme settings */
  function cacheThemeSettings() {
    if (!import.meta.env.PROD) {
      return;
    }

    localStg.set('themeSettings', settings.value);
  }

  // Cache the theme settings when the page is closed or refreshed
  useEventListener(window, 'beforeunload', () => {
    cacheThemeSettings();
  });

  // Watch store
  scope.run(() => {
    // Watch dark mode
    watch(
      darkMode,
      (val) => {
        toggleCssDarkMode(val);
        syncVuetifyTheme();
        localStg.set('darkMode', val);
      },
      { immediate: true },
    );

    watch(
      [grayscaleMode, colourWeaknessMode],
      (val) => {
        toggleAuxiliaryColorModes(val[0], val[1]);
      },
      { immediate: true },
    );

    // Theme colors change, update css vars and the stored theme color
    watch(
      themeColors,
      (val) => {
        setupThemeVarsToGlobal();
        syncVuetifyTheme();
        localStg.set('themeColor', val.primary);
      },
      { immediate: true },
    );

    // The radius lives in the Vuetify theme variables, so the watcher re-syncs them.
    watch(
      () => settings.value.themeRadius,
      () => {
        syncVuetifyTheme();
      },
      { immediate: true },
    );

    // Watch watermark settings to control the timer
    watch(
      () => [settings.value.watermark.visible, settings.value.watermark.enableTime],
      () => {
        updateWatermarkTimer();
      },
      { immediate: true },
    );
  });

  /** On scope dispose */
  onScopeDispose(() => {
    scope.stop();
  });

  // `settings` is mutated in place (applySettings and $reset merge into it), never
  // replaced, so these property refs keep pointing at the live store state.
  return {
    ...toRefs(settings.value),
    darkMode,
    themeColors,
    settingsJson,
    watermarkContent,
    setGrayscale,
    setColourWeakness,
    resetStore,
    applySettings,
    setThemeScheme,
    toggleThemeScheme,
    updateThemeColors,
    setThemeLayout,
    setThemeRadius,
    setWatermarkEnableUserName,
    setWatermarkEnableTime,
  };
});
