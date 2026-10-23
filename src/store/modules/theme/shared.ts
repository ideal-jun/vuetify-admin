import { defu } from 'defu';

import { DARK_CLASS } from '@/constants/app';
import { overrideThemeSettings, themeSettings } from '@/theme/settings';
import { themeVars } from '@/theme/vars';
import {
  addColorAlpha,
  getColorPalette,
  getContrastColor,
  getPaletteColorByNumber,
  getRgb,
  getRgbString,
} from '@/utils/color';
import { toggleHtmlClass } from '@/utils/common';
import { localStg } from '@/utils/storage';

/** Init theme settings */
export function initThemeSettings(): App.Theme.ThemeSetting {
  const isProd = import.meta.env.PROD;

  // In development the theme settings are not cached, update `themeSettings` to update them.
  if (!isProd) {
    return structuredClone(themeSettings);
  }

  const localSettings = localStg.get('themeSettings');

  let settings = defu(localSettings || {}, themeSettings);

  const buildTime = typeof BUILD_TIME === 'undefined' ? 'dev' : BUILD_TIME;
  const isOverride = localStg.get('overrideThemeFlag') === buildTime;

  if (!isOverride) {
    settings = defu(overrideThemeSettings, settings);

    localStg.set('overrideThemeFlag', buildTime);
  }

  return settings;
}

/**
 * Create the theme token css variables value by theme settings
 *
 * @param colors Theme colors
 * @param tokens Theme setting tokens
 * @param [recommended=false] Use the recommended color algorithm
 */
export function createThemeToken(
  colors: App.Theme.ThemeColor,
  tokens?: App.Theme.ThemeSetting['tokens'],
  recommended = false,
) {
  const paletteColors = createThemePaletteColors(colors, recommended);

  const { light, dark } = tokens || themeSettings.tokens;

  const themeTokens: App.Theme.ThemeTokenCSSVars = {
    colors: {
      ...paletteColors,
      nprogress: paletteColors.primary,
      ...light.colors,
    },
    boxShadow: {
      ...light.boxShadow,
    },
  };

  const darkThemeTokens: App.Theme.ThemeTokenCSSVars = {
    colors: {
      ...themeTokens.colors,
      ...dark?.colors,
    },
    boxShadow: {
      ...themeTokens.boxShadow,
      ...dark?.boxShadow,
    },
  };

  return {
    themeTokens,
    darkThemeTokens,
  };
}

/**
 * Create theme palette colors
 *
 * @param colors Theme colors
 * @param [recommended=false] Use the recommended color algorithm
 */
function createThemePaletteColors(colors: App.Theme.ThemeColor, recommended = false) {
  const colorKeys = Object.keys(colors) as App.Theme.ThemeColorKey[];
  const colorPaletteVar = {} as App.Theme.ThemePaletteColor;

  for (const key of colorKeys) {
    const colorMap = getColorPalette(colors[key], recommended);

    colorPaletteVar[key] = colorMap.get(500) ?? colors[key];

    for (const [number, hex] of colorMap.entries()) {
      colorPaletteVar[`${key}-${number}`] = hex;
    }
  }

  return colorPaletteVar;
}

/**
 * Get css variables by tokens
 *
 * @param tokens Theme base tokens
 */
function getCssVarByTokens(tokens: App.Theme.BaseToken) {
  const styles: string[] = [];

  function removeVarPrefix(value: string) {
    return value.replace('var(', '').replace(')', '');
  }

  function removeRgbPrefix(value: string) {
    return value.replace('rgb(', '').replace(')', '');
  }

  for (const [key, tokenValues] of Object.entries(themeVars)) {
    for (const [tokenKey, tokenValue] of Object.entries(tokenValues)) {
      const cssValue = tokens[key]?.[tokenKey];

      if (cssValue === undefined) {
        continue;
      }

      let cssVarsKey = removeVarPrefix(tokenValue);

      if (key === 'colors') {
        cssVarsKey = removeRgbPrefix(cssVarsKey);
        styles.push(`${cssVarsKey}: ${getRgbString(cssValue)}`);
      } else {
        styles.push(`${cssVarsKey}: ${cssValue}`);
      }
    }
  }

  return styles.join(';');
}

/**
 * Add the theme variables to the global document
 *
 * @param tokens
 * @param darkTokens
 */
export function addThemeVarsToGlobal(tokens: App.Theme.BaseToken, darkTokens: App.Theme.BaseToken) {
  const cssVarStr = getCssVarByTokens(tokens);
  const darkCssVarStr = getCssVarByTokens(darkTokens);

  const css = `
    :root {
      ${cssVarStr}
    }
  `;

  const darkCss = `
    html.${DARK_CLASS} {
      ${darkCssVarStr}
    }
  `;

  const styleId = 'theme-vars';

  const style = document.querySelector(`#${styleId}`) || document.createElement('style');

  style.id = styleId;

  style.textContent = css + darkCss;

  document.head.append(style);
}

/**
 * Toggle css dark mode
 *
 * @param darkMode Is dark mode
 */
export function toggleCssDarkMode(darkMode = false) {
  const { add, remove } = toggleHtmlClass(DARK_CLASS);

  if (darkMode) {
    add();
  } else {
    remove();
  }
}

/**
 * Toggle auxiliary color modes
 *
 * @param grayscaleMode
 * @param colourWeakness
 */
export function toggleAuxiliaryColorModes(grayscaleMode = false, colourWeakness = false) {
  const htmlElement = document.documentElement;

  htmlElement.style.filter = [
    grayscaleMode ? 'grayscale(100%)' : '',
    colourWeakness ? 'invert(80%)' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Create Vuetify theme colors
 *
 * @param colors Theme colors
 * @param dark Is dark mode
 */
export function createVuetifyThemeColors(colors: App.Theme.ThemeColor, dark: boolean) {
  const { light, dark: darkTokens } = themeSettings.tokens;

  return {
    background: dark ? darkTokens?.colors?.layout || light.colors.layout : light.colors.layout,
    surface: dark
      ? darkTokens?.colors?.container || light.colors.container
      : light.colors.container,
    primary: colors.primary,
    secondary: getPaletteColorByNumber(colors.primary, 300, true),
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    'on-primary': getContrastColor(colors.primary),
    'on-background': dark ? '#e0e0e0' : '#1f1f1f',
    'on-surface': dark ? '#e0e0e0' : '#1f1f1f',
  };
}

/**
 * Create a Vuetify theme definition
 *
 * @param colors Theme colors
 * @param dark Is dark mode
 */
export function createVuetifyTheme(colors: App.Theme.ThemeColor, dark: boolean) {
  return {
    dark,
    colors: createVuetifyThemeColors(colors, dark),
    variables: {
      'border-radius-root': '10px',
    },
  };
}

/** Get the css alpha variant of a theme color */
export function getThemeColorAlpha(color: string, alpha = 0.12) {
  return addColorAlpha(color, alpha);
}

/** Get the rgb channels of a theme color */
export function getThemeColorRgb(color: string) {
  return getRgb(color);
}
