import type { Router } from 'vue-router';

import { $t } from '@/locales';
import type { LastLevelRouteKey, RouteKey } from '@/router/route-key';
import { getRoutePath } from '@/router/route-key';

/** Get all tabs */
export function getAllTabs(tabs: App.Global.Tab[], homeTab?: App.Global.Tab) {
  if (!homeTab) {
    return [];
  }

  const filterHomeTabs = tabs.filter((tab) => tab.id !== homeTab.id);

  const fixedTabs = filterHomeTabs
    .filter((tab) => isFixedTab(tab))
    .toSorted((a, b) => (a.fixedIndex ?? 0) - (b.fixedIndex ?? 0));

  const remainTabs = filterHomeTabs.filter((tab) => !isFixedTab(tab));

  return updateTabsLabel([homeTab, ...fixedTabs, ...remainTabs]);
}

function isFixedTab(tab: App.Global.Tab) {
  return tab.fixedIndex !== undefined && tab.fixedIndex !== null;
}

/** Get the tab id by route */
export function getTabIdByRoute(route: App.Global.TabRoute) {
  const { path, query = {}, meta } = route;

  let id = path;

  if (meta?.multiTab) {
    const queryKeys = Object.keys(query).toSorted();
    const qs = queryKeys.map((key) => `${key}=${String(query[key])}`).join('&');

    id = `${path}?${qs}`;
  }

  return id;
}

/** Get a tab by route */
export function getTabByRoute(route: App.Global.TabRoute) {
  const { name, path, fullPath = path, meta } = route;

  const { title = '', i18nKey, fixedIndexInTab } = meta ?? {};

  const { icon, localIcon } = getRouteIcons(route);

  const label = i18nKey ? $t(i18nKey) : title;

  const tab: App.Global.Tab = {
    id: getTabIdByRoute(route),
    label,
    routeKey: name as LastLevelRouteKey,
    routePath: path,
    fullPath,
    fixedIndex: fixedIndexInTab,
    icon,
    localIcon,
    i18nKey,
  };

  return tab;
}

/**
 * The vue router automatically merges the meta of all matched items, and the icons here may be affected by other
 * matching items, so they need to be processed separately.
 */
export function getRouteIcons(route: App.Global.TabRoute) {
  let icon: string = route.meta?.icon || import.meta.env.VITE_MENU_ICON;
  let localIcon: string | undefined = route.meta?.localIcon;

  if (route.matched) {
    const currentRoute = route.matched.find((r) => r.name === route.name);

    icon = currentRoute?.meta?.icon || icon;
    localIcon = currentRoute?.meta?.localIcon;
  }

  return { icon, localIcon };
}

/** Get the default home tab */
export function getDefaultHomeTab(router: Router, homeRouteName: LastLevelRouteKey) {
  const homeRoutePath = getRoutePath(homeRouteName);

  let homeTab: App.Global.Tab = {
    id: homeRoutePath,
    label: $t(`route.${homeRouteName}` as App.I18n.I18nKey),
    routeKey: homeRouteName,
    routePath: homeRoutePath,
    fullPath: homeRoutePath,
  };

  const routes = router.getRoutes();
  const homeRoute = routes.find((route) => route.name === homeRouteName);

  if (homeRoute) {
    homeTab = getTabByRoute(homeRoute);
  }

  return homeTab;
}

/** Whether the tab is in the tabs */
export function isTabInTabs(tabId: string, tabs: App.Global.Tab[]) {
  return tabs.some((tab) => tab.id === tabId);
}

/** Filter tabs by id */
export function filterTabsById(tabId: string, tabs: App.Global.Tab[]) {
  return tabs.filter((tab) => tab.id !== tabId);
}

/** Filter tabs by ids */
export function filterTabsByIds(tabIds: string[], tabs: App.Global.Tab[]) {
  return tabs.filter((tab) => !tabIds.includes(tab.id));
}

/** Extract tabs by all routes */
export function extractTabsByAllRoutes(router: Router, tabs: App.Global.Tab[]) {
  const routes = router.getRoutes();

  const routeNames = new Set(routes.map((route) => route.name));

  return tabs.filter((tab) => routeNames.has(tab.routeKey));
}

/** Get fixed tabs */
export function getFixedTabs(tabs: App.Global.Tab[]) {
  return tabs.filter((tab) => isFixedTab(tab));
}

/** Get fixed tab ids */
export function getFixedTabIds(tabs: App.Global.Tab[]) {
  return getFixedTabs(tabs).map((tab) => tab.id);
}

/** Reorder fixed tabs */
export function reorderFixedTabs(tabs: App.Global.Tab[]) {
  for (const [index, tab] of getFixedTabs(tabs).entries()) {
    tab.fixedIndex = index;
  }
}

function updateTabsLabel(tabs: App.Global.Tab[]) {
  return tabs.map((tab) => ({
    ...tab,
    label: tab.newLabel || tab.oldLabel || tab.label,
  }));
}

/** Update a tab by its i18n key */
export function updateTabByI18nKey(tab: App.Global.Tab) {
  const { i18nKey, label } = tab;

  return {
    ...tab,
    label: i18nKey ? $t(i18nKey) : label,
  };
}

/** Update tabs by their i18n keys */
export function updateTabsByI18nKey(tabs: App.Global.Tab[]) {
  return tabs.map((tab) => updateTabByI18nKey(tab));
}

/** Find a tab by route name */
export function findTabByRouteName(name: RouteKey, tabs: App.Global.Tab[]) {
  const routePath = getRoutePath(name);

  const tabId = routePath;
  const multiTabId = `${routePath}?`;

  return tabs.find((tab) => tab.id === tabId || tab.id.startsWith(multiTabId));
}
