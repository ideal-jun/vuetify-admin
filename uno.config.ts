import { defineConfig, presetWind4, transformerDirectives } from 'unocss';
import { createThemeVariants } from 'unocss-preset-vuetify';

import * as breakpoints from './src/theme/breakpoints';

// Vuetify elevation levels mapped to presetWind4's shadow scale.
const elevationShadows = {
  'elevation-0': 'shadow-none',
  'elevation-1': 'shadow-xs',
  'elevation-2': 'shadow-sm',
  'elevation-3': 'shadow-md',
  'elevation-4': 'shadow-xl',
  'elevation-5': 'shadow-2xl',
  'elevation-6':
    'shadow-[0_3px_5px_-1px_rgba(0,0,0,0.2),0_6px_10px_0_rgba(0,0,0,0.14),0_1px_18px_0_rgba(0,0,0,0.12)]',
  'elevation-8':
    'shadow-[0_5px_5px_-3px_rgba(0,0,0,0.2),0_8px_10px_1px_rgba(0,0,0,0.14),0_3px_14px_2px_rgba(0,0,0,0.12)]',
};

export default defineConfig({
  presets: [presetWind4()],
  transformers: [transformerDirectives()],
  theme: {
    breakpoint: breakpoints.forUnoCSS,
    radius: {
      pill: '9999px',
      circle: '50%',
      shaped: 'calc(var(--v-border-radius-root, 10px) * 6) 0',
    },
    font: {
      heading: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif',
      mono: '"Roboto Mono", sans-serif',
    },
    colors: {
      primary: 'rgb(var(--v-theme-primary))',
      ...Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [
          `primary-${n}`,
          `rgb(var(--primary-${n}-color))`,
        ]),
      ),
      // The theme stylesheet defines these tokens as rgb channel triplets.
      container: 'rgb(var(--container-bg-color))',
      layout: 'rgb(var(--layout-bg-color))',
      inverted: 'rgb(var(--inverted-bg-color))',
      'base-text': 'rgb(var(--base-text-color))',
    },
  },
  variants: createThemeVariants(['light', 'dark']),
  safelist: [
    'font-heading',
    'font-body',
    'font-mono',
    ...Object.keys(elevationShadows),
    ...['', '-0', '-sm', '-lg', '-xl', '-pill', '-circle', '-shaped'].map(
      (suffix) => `rounded${suffix}`,
    ),
  ],
  outputToCssLayers: {
    cssLayerName: (layer) => (layer === 'properties' ? null : `uno-${layer}`),
  },
  shortcuts: {
    ...elevationShadows,
    'app-card':
      'bg-gray-200 dark:bg-black dark:bg-linear-to-r dark:from-primary/50 dark:to-primary/30 dark:text-white/80',
    'app-panel': 'bg-container',
    'app-shadow-header': 'shadow-[var(--header-box-shadow)]',
    'app-shadow-sider': 'shadow-[var(--sider-box-shadow)]',
    'app-shadow-tab': 'shadow-[var(--tab-box-shadow)]',
    'flex-center': 'flex items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'flex-y-center': 'flex items-center',
    'flex-x-center': 'flex justify-center',
    'flex-col-stretch': 'flex flex-col items-stretch',
    'flex-1-hidden': 'min-w-0 flex-1 overflow-hidden',
    'nowrap-hidden': 'overflow-hidden whitespace-nowrap',
    'ellipsis-text': 'overflow-hidden text-ellipsis whitespace-nowrap',
    'absolute-center': 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'fixed-center': 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'size-full': 'h-full w-full',
    'text-icon': 'text-[1.25rem]',
    'text-icon-small': 'text-[1rem]',
    'text-icon-large': 'text-[1.5rem]',
    'text-display-large':
      '  font-heading normal-case text-[3.5625rem] font-[400] leading-[1.1228] tracking-[-.0044em]',
    'text-display-medium':
      ' font-heading normal-case text-[2.8125rem] font-[400] leading-[1.1556] tracking-[normal]',
    'text-display-small':
      '  font-heading normal-case text-[2.25rem]   font-[400] leading-[1.2222] tracking-[normal]',
    'text-headline-large':
      ' font-heading normal-case text-[2rem]      font-[400] leading-[1.25]   tracking-[normal]',
    'text-headline-medium':
      'font-heading normal-case text-[1.75rem]   font-[400] leading-[1.2857] tracking-[normal]',
    'text-headline-small':
      ' font-heading normal-case text-[1.5rem]    font-[400] leading-[1.3333] tracking-[normal]',
    'text-title-large':
      '    font-heading normal-case text-[1.375rem]  font-[400] leading-[1.2727] tracking-[normal]',
    'text-title-medium':
      '   font-body    normal-case text-[1rem]      font-[500] leading-[1.5]    tracking-[.0094em]',
    'text-title-small':
      '    font-body    normal-case text-[.875rem]   font-[500] leading-[1.4286] tracking-[.0071em]',
    'text-body-large':
      '     font-body    normal-case text-[1rem]      font-[400] leading-[1.5]    tracking-[.0313em]',
    'text-body-medium':
      '    font-body    normal-case text-[.875rem]   font-[400] leading-[1.4286] tracking-[.0179em]',
    'text-body-small':
      '     font-body    normal-case text-[.75rem]    font-[400] leading-[1.3333] tracking-[.0333em]',
    'text-label-large':
      '    font-body    normal-case text-[.875rem]   font-[500] leading-[1.4286] tracking-[.0071em]',
    'text-label-medium':
      '   font-body    normal-case text-[.75rem]    font-[500] leading-[1.3333] tracking-[.0417em]',
    'text-label-small':
      '    font-body    normal-case text-[.6875rem]  font-[500] leading-[1.4545] tracking-[.0455em]',
  },
});
