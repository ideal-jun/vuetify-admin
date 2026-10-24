/** A map of iconify style names to the bundled MDI icon names */
const ICON_MAP: Record<string, string> = {
  'material-symbols:sunny': 'mdi-weather-sunny',
  'material-symbols:nightlight-rounded': 'mdi-weather-night',
  'material-symbols:hdr-auto': 'mdi-theme-light-dark',
  'ph:user-circle': 'mdi-account-circle-outline',
  'ph:sign-out': 'mdi-logout',
  'heroicons:language': 'mdi-translate',
  'majesticons:color-swatch-line': 'mdi-palette-outline',
  'line-md:menu-fold-left': 'mdi-menu',
  'line-md:menu-fold-right': 'mdi-menu-open',
  'ph-caret-double-left-bold': 'mdi-chevron-double-left',
  'ph-caret-double-right-bold': 'mdi-chevron-double-right',
  'ant-design:reload-outlined': 'mdi-reload',
  'gridicons:fullscreen': 'mdi-fullscreen',
  'gridicons:fullscreen-exit': 'mdi-fullscreen-exit',
  'uil:search': 'mdi-magnify',
  'mdi:keyboard-esc': 'mdi-keyboard-esc',
};

/** RuoYi uses Element icon names; map the common ones to the bundled MDI font */
const RUOYI_ICON_MAP: Record<string, string> = {
  build: 'mdi-hammer-wrench',
  code: 'mdi-code-tags',
  config: 'mdi-cog-outline',
  dict: 'mdi-book-open-variant',
  edit: 'mdi-pencil',
  form: 'mdi-form-select',
  guide: 'mdi-book-open-page-variant',
  job: 'mdi-clock-outline',
  log: 'mdi-file-document-outline',
  logininfor: 'mdi-login',
  message: 'mdi-bell-outline',
  monitor: 'mdi-monitor',
  nacos: 'mdi-hexagon-outline',
  online: 'mdi-account-clock-outline',
  peoples: 'mdi-account-group-outline',
  post: 'mdi-badge-account-outline',
  sentinel: 'mdi-shield-alert-outline',
  server: 'mdi-server-outline',
  swagger: 'mdi-api',
  system: 'mdi-cog-outline',
  tool: 'mdi-wrench-outline',
  tree: 'mdi-file-tree',
  'tree-table': 'mdi-table',
  user: 'mdi-account-outline',
};

/**
 * Translate a RuoYi (Element) icon name to the bundled MDI font
 *
 * Plain MDI names are returned as-is, unknown names fall back to a neutral icon.
 */
export function translateRuoYiIcon(icon?: string) {
  if (!icon) {
    return 'mdi-circle-small';
  }

  return RUOYI_ICON_MAP[icon] ?? (icon.startsWith('mdi-') ? icon : 'mdi-circle-small');
}

/**
 * Normalize an icon name
 *
 * The template only ships the MDI font, so iconify style names are mapped to their MDI equivalents. Plain MDI names
 * such as `mdi-home` are returned as-is.
 *
 * @param icon The icon name
 */
export function normalizeIcon(icon?: string) {
  if (!icon) {
    return 'mdi-circle-small';
  }

  const mapped = ICON_MAP[icon];

  if (mapped) {
    return mapped;
  }

  if (icon.startsWith('mdi:')) {
    return icon.replace(':', '-');
  }

  if (!icon.includes(':')) {
    return icon;
  }

  return 'mdi-help-circle-outline';
}

/** Get the names of the local svg icons */
export function getLocalIcons() {
  const svgIcons = import.meta.glob('/src/assets/svg-icon/*.svg');

  const keys = Object.keys(svgIcons)
    .map((item) => item.split('/').at(-1)?.replace('.svg', '') || '')
    .filter(Boolean);

  return keys;
}
