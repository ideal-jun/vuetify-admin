import { env } from '@/env';
import { getColorPalette, getRgb } from '@/utils/color';
import { localStg } from '@/utils/storage';

/** Render a themed loading screen before the app is mounted */
export function setupLoading() {
  const themeColor = localStg.get('themeColor') || '#646cff';
  const palette = getColorPalette(themeColor);
  const { r, g, b } = getRgb(themeColor);

  const isDark = localStg.get('darkMode') === true;

  const cssVars = [
    `--primary-color: ${r} ${g} ${b}`,
    `--v-theme-primary: ${r}, ${g}, ${b}`,
    `--layout-bg-color: ${isDark ? '#121216' : '#f5f7fb'}`,
    `--base-text-color: ${isDark ? '224, 224, 224' : '31, 31, 31'}`,
    ...Array.from(palette.entries()).map(([key, value]) => `--logo-color-${key}: ${value}`),
  ].join('; ');

  const dots = [
    'left-0 top-0',
    'left-0 bottom-0 animate-delay-500',
    'right-0 top-0 animate-delay-1000',
    'right-0 bottom-0 animate-delay-1500',
  ]
    .map(
      (item) =>
        `<div class="absolute w-16px h-16px bg-primary rounded-8px animate-pulse ${item}"></div>`,
    )
    .join('\n');

  const app = document.querySelector('#app');

  if (!app) {
    return;
  }

  app.innerHTML = `
<div class="fixed-center flex-col bg-layout" style="${cssVars}">
  <div class="w-128px h-128px">
    <img src="/favicon.ico" alt="logo" class="size-full" />
  </div>
  <div class="w-56px h-56px my-36px">
    <div class="relative h-full animate-spin">
      ${dots}
    </div>
  </div>
  <h2 class="text-28px font-500 text-primary">${env.appTitle}</h2>
</div>`;
}
