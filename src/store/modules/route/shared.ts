import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router';

import { isDev } from '@/constants/env';
import { env } from '@/env';
import { $t } from '@/locales';
import type { ElegantConstRoute, LastLevelRouteKey, RouteKey, RouteMap } from '@/router/route-key';

/**
 * Filter auth routes by roles
 *
 * @param routes Auth routes
 * @param roles Roles
 */
export function filterAuthRoutesByRoles(routes: ElegantConstRoute[], roles: string[]) {
  return routes.flatMap((route) => filterAuthRouteByRoles(route, roles));
}

/**
 * Filter an auth route by roles
 *
 * @param route Auth route
 * @param roles Roles
 */
function filterAuthRouteByRoles(route: ElegantConstRoute, roles: string[]): ElegantConstRoute[] {
  const routeRoles = route.meta?.roles || [];

  // If the route's "roles" is empty, it is allowed to access
  const isEmptyRoles = routeRoles.length === 0;

  // If the user's role is included in the route's "roles", it is allowed to access
  const hasPermission = routeRoles.some((role) => roles.includes(role));

  const filterRoute: ElegantConstRoute = { ...route };

  if (filterRoute.children?.length) {
    filterRoute.children = filterRoute.children.flatMap((item) =>
      filterAuthRouteByRoles(item, roles),
    );
  }

  // Exclude the route if it has no children after filtering
  if (filterRoute.children?.length === 0) {
    return [];
  }

  return hasPermission || isEmptyRoles ? [filterRoute] : [];
}

/**
 * Filter routes by `meta.isDev`
 *
 * Routes with `meta.isDev` are only loaded in the development environment
 *
 * @param routes Auth routes
 */
export function filterRoutesByDev(routes: ElegantConstRoute[]) {
  if (isDev) {
    return routes;
  }

  return routes.flatMap((route) => filterRouteByDev(route));
}

function filterRouteByDev(route: ElegantConstRoute): ElegantConstRoute[] {
  if (route.meta?.isDev) {
    return [];
  }

  const filterRoute: ElegantConstRoute = { ...route };

  if (filterRoute.children?.length) {
    filterRoute.children = filterRoute.children.flatMap((item) => filterRouteByDev(item));
  }

  if (filterRoute.children?.length === 0) {
    return [];
  }

  return [filterRoute];
}

/** Sort routes by order */
function sortRouteByOrder(route: ElegantConstRoute) {
  if (route.children?.length) {
    route.children.sort(
      (next, prev) => (Number(next.meta?.order) || 0) - (Number(prev.meta?.order) || 0),
    );

    for (const child of route.children) {
      sortRouteByOrder(child);
    }
  }

  return route;
}

/** Sort routes by order */
export function sortRoutesByOrder(routes: ElegantConstRoute[]) {
  routes.sort((next, prev) => (Number(next.meta?.order) || 0) - (Number(prev.meta?.order) || 0));

  for (const route of routes) {
    sortRouteByOrder(route);
  }

  return routes;
}

/**
 * Resolve a route path against its parent path
 *
 * The static routes always declare absolute paths, while the RuoYi router tree uses relative paths for the children.
 */
export function resolveRoutePath(parentPath: string, routePath: string) {
  if (routePath.startsWith('/')) {
    return routePath;
  }

  const base = parentPath.replace(/\/+$/u, '');

  return routePath ? `${base}/${routePath}` : base;
}

/** Get global menus by auth routes */
export function getGlobalMenusByAuthRoutes(routes: ElegantConstRoute[], parentPath = '') {
  const menus: App.Global.Menu[] = [];

  for (const route of routes) {
    if (!route.meta?.hideInMenu) {
      const routePath = resolveRoutePath(parentPath, route.path);
      const menu = getGlobalMenuByBaseRoute(route, routePath);

      if (route.children?.some((child) => !child.meta?.hideInMenu)) {
        menu.children = getGlobalMenusByAuthRoutes(route.children, routePath);
      }

      menus.push(menu);
    }
  }

  return menus;
}

/** Update the locale of global menus */
export function updateLocaleOfGlobalMenus(menus: App.Global.Menu[]) {
  const result: App.Global.Menu[] = [];

  for (const menu of menus) {
    const { i18nKey, label, children } = menu;

    const newLabel = i18nKey ? $t(i18nKey) : label;

    const newMenu: App.Global.Menu = {
      ...menu,
      label: newLabel,
    };

    if (children?.length) {
      newMenu.children = updateLocaleOfGlobalMenus(children);
    }

    result.push(newMenu);
  }

  return result;
}

/** Get the global menu by base route */
function getGlobalMenuByBaseRoute(
  route: RouteLocationNormalizedLoaded | ElegantConstRoute,
  routePath = route.path,
) {
  const { name } = route;
  const { title = '', i18nKey, icon = env.menuIcon } = route.meta ?? {};

  const label = i18nKey ? $t(i18nKey) : title;

  const menu: App.Global.Menu = {
    key: name as string,
    label,
    i18nKey,
    routeKey: name as RouteKey,
    routePath: routePath as RouteMap[RouteKey],
    icon,
  };

  return menu;
}

/** Get cache route names */
export function getCacheRouteNames(routes: RouteRecordRaw[]) {
  const cacheNames: LastLevelRouteKey[] = [];

  const collect = (items: RouteRecordRaw[]) => {
    for (const route of items) {
      if (route.component && route.meta?.keepAlive && route.name) {
        cacheNames.push(route.name as LastLevelRouteKey);
      }

      if (route.children?.length) {
        collect(route.children);
      }
    }
  };

  collect(routes);

  return cacheNames;
}

/** Whether the route exists by route name */
export function isRouteExistByRouteName(routeName: RouteKey, routes: ElegantConstRoute[]) {
  return routes.some((route) => recursiveGetIsRouteExistByRouteName(route, routeName));
}

function recursiveGetIsRouteExistByRouteName(
  route: ElegantConstRoute,
  routeName: RouteKey,
): boolean {
  if (route.name === routeName) {
    return true;
  }

  if (route.children?.length) {
    return route.children.some((item) => recursiveGetIsRouteExistByRouteName(item, routeName));
  }

  return false;
}

/**
 * Whether the route exists by route path
 *
 * It is the fallback for the routes declared by the backend, whose name is not in the static route map.
 */
export function isRouteExistByRoutePath(routePath: string, routes: ElegantConstRoute[]) {
  return routes.some((route) => recursiveGetIsRouteExistByRoutePath(route, '', routePath));
}

function recursiveGetIsRouteExistByRoutePath(
  route: ElegantConstRoute,
  parentPath: string,
  routePath: string,
): boolean {
  const fullPath = resolveRoutePath(parentPath, route.path);

  if (fullPath === routePath) {
    return true;
  }

  if (route.children?.length) {
    return route.children.some((item) =>
      recursiveGetIsRouteExistByRoutePath(item, fullPath, routePath),
    );
  }

  return false;
}

/** Get the selected menu key path */
export function getSelectedMenuKeyPathByKey(selectedKey: string, menus: App.Global.Menu[]) {
  const keyPath: string[] = [];

  menus.some((menu) => {
    const path = findMenuPath(selectedKey, menu);

    const find = Boolean(path?.length);

    if (find) {
      keyPath.push(...(path || []));
    }

    return find;
  });

  return keyPath;
}

function findMenuPath(targetKey: string, menu: App.Global.Menu): string[] | null {
  const path: string[] = [];

  function dfs(item: App.Global.Menu): boolean {
    path.push(item.key);

    if (item.key === targetKey) {
      return true;
    }

    if (item.children) {
      for (const child of item.children) {
        if (dfs(child)) {
          return true;
        }
      }
    }

    path.pop();

    return false;
  }

  return dfs(menu) ? path : null;
}

function transformMenuToBreadcrumb(menu: App.Global.Menu) {
  const { children, ...rest } = menu;

  const breadcrumb: App.Global.Breadcrumb = {
    ...rest,
  };

  if (children?.length) {
    breadcrumb.options = children.map((child) => transformMenuToBreadcrumb(child));
  }

  return breadcrumb;
}

/** Get breadcrumbs by route */
export function getBreadcrumbsByRoute(
  route: RouteLocationNormalizedLoaded,
  menus: App.Global.Menu[],
): App.Global.Breadcrumb[] {
  const key = route.name as string;
  const activeKey = route.meta?.activeMenu;

  for (const menu of menus) {
    if (menu.key === key) {
      return [transformMenuToBreadcrumb(menu)];
    }

    if (menu.key === activeKey) {
      const ROUTE_DEGREE_SPLITTER = '_';

      const parentKey = key.split(ROUTE_DEGREE_SPLITTER).slice(0, -1).join(ROUTE_DEGREE_SPLITTER);

      const breadcrumbMenu = getGlobalMenuByBaseRoute(route);

      if (parentKey !== activeKey) {
        return [transformMenuToBreadcrumb(breadcrumbMenu)];
      }

      return [transformMenuToBreadcrumb(menu), transformMenuToBreadcrumb(breadcrumbMenu)];
    }

    if (menu.children?.length) {
      const result = getBreadcrumbsByRoute(route, menu.children);

      if (result.length > 0) {
        return [transformMenuToBreadcrumb(menu), ...result];
      }
    }
  }

  return [];
}

/** Transform menus to search menus */
export function transformMenuToSearchMenus(
  menus: App.Global.Menu[],
  treeMap: App.Global.Menu[] = [],
) {
  if (menus.length === 0) {
    return [];
  }

  return menus.reduce((acc, cur) => {
    if (!cur.children) {
      acc.push(cur);
    }

    if (cur.children?.length) {
      transformMenuToSearchMenus(cur.children, treeMap);
    }

    return acc;
  }, treeMap);
}
