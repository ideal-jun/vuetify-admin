export interface LayoutMenuConfig {
  /** The menus rendered in the header */
  headerMenus: App.Global.Menu[];
  /** The menus rendered in the main sider (or the second panel of the mix layout) */
  siderMenus: App.Global.Menu[];
  /** The first level menus rendered in the mix layout rail */
  railMenus: App.Global.Menu[];
  /** The maximum depth of the sider menu */
  siderMaxDepth?: number;
  /** Whether the sider is visible for the current route */
  showSider: boolean;
  /** Whether the sider renders the logo */
  showSiderLogo: boolean;
  /** Whether the layout is the vertical mix layout */
  isVerticalMix: boolean;
  /** Whether the layout is the compact top hybrid layout */
  isTopHybridHeaderFirst: boolean;
}

/** Find the first level menu that owns the current route */
export function getActiveTopMenu(menus: App.Global.Menu[], routeName: string) {
  return menus.find((menu) => routeName === menu.key || routeName.startsWith(`${menu.key}_`));
}

/**
 * Compute which menu tree each layout region renders.
 *
 * Keeping this mapping pure makes the six layout modes easy to test without mounting the Vuetify layout.
 */
export function getLayoutMenuConfig(
  mode: UnionKey.ThemeLayoutMode,
  menus: App.Global.Menu[],
  routeName: string,
  activeMenu?: string | null,
): LayoutMenuConfig {
  const activeTopMenu = getActiveTopMenu(menus, activeMenu || routeName);
  const childMenus = activeTopMenu?.children ?? [];

  if (mode === 'horizontal') {
    return {
      headerMenus: menus,
      siderMenus: [],
      railMenus: [],
      showSider: false,
      showSiderLogo: false,
      isVerticalMix: false,
      isTopHybridHeaderFirst: false,
    };
  }

  if (mode === 'vertical-mix') {
    return {
      headerMenus: [],
      siderMenus: childMenus,
      railMenus: menus,
      showSider: true,
      showSiderLogo: true,
      isVerticalMix: true,
      isTopHybridHeaderFirst: false,
    };
  }

  if (mode === 'top-hybrid-sidebar-first' || mode === 'top-hybrid-header-first') {
    return {
      headerMenus: menus,
      siderMenus: childMenus,
      railMenus: [],
      showSider: childMenus.length > 0,
      showSiderLogo: false,
      isVerticalMix: false,
      isTopHybridHeaderFirst: mode === 'top-hybrid-header-first',
    };
  }

  if (mode === 'vertical-hybrid-header-first') {
    return {
      headerMenus: childMenus,
      siderMenus: menus,
      railMenus: [],
      siderMaxDepth: 0,
      showSider: true,
      showSiderLogo: true,
      isVerticalMix: false,
      isTopHybridHeaderFirst: false,
    };
  }

  return {
    headerMenus: [],
    siderMenus: menus,
    railMenus: [],
    showSider: true,
    showSiderLogo: true,
    isVerticalMix: false,
    isTopHybridHeaderFirst: false,
  };
}
