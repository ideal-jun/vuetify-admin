import { addColorAlpha, transformColorWithOpacity } from '@/utils/color';

export type PageTabMode = 'chrome' | 'button' | 'slider';

export interface PageTabCssVars {
  [key: `--${string}`]: string;
  '--page-tab-primary': string;
  '--page-tab-primary-1': string;
  '--page-tab-primary-2': string;
  '--page-tab-primary-opacity-1': string;
  '--page-tab-primary-opacity-2': string;
  '--page-tab-primary-opacity-3': string;
}

/** Create the CSS variables used by the tab styles */
export function createTabCssVars(primaryColor: string): PageTabCssVars {
  return {
    '--page-tab-primary': primaryColor,
    '--page-tab-primary-1': transformColorWithOpacity(primaryColor, 0.1, '#ffffff'),
    '--page-tab-primary-2': transformColorWithOpacity(primaryColor, 0.3, '#000000'),
    '--page-tab-primary-opacity-1': addColorAlpha(primaryColor, 0.1),
    '--page-tab-primary-opacity-2': addColorAlpha(primaryColor, 0.15),
    '--page-tab-primary-opacity-3': addColorAlpha(primaryColor, 0.3),
  };
}
