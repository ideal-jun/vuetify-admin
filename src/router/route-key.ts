import type { RouteComponent, RouteRecordRaw, _RouteRecordBase } from 'vue-router';

/**
 * The route name and path map
 *
 * It is the single source of truth of the route keys and paths, keep it in sync when adding a route.
 */
export const routeMap = {
  root: '/',
  'not-found': '/:pathMatch(.*)*',
  '403': '/403',
  '404': '/404',
  '500': '/500',
  home: '/home',
  'iframe-page': '/iframe-page/:url',
  login: '/login',
  system: '/system',
  system_menu: '/system/menu',
  system_user: '/system/user',
  system_role: '/system/role',
  unsupported: '/unsupported',
} as const;

/** The route name and path map type */
export type RouteMap = typeof routeMap;

/** The route key */
export type RouteKey = keyof RouteMap;

/** The route path */
export type RoutePath = RouteMap[RouteKey];

/** The route layout */
export type RouteLayout = 'base' | 'blank';

/** The last level route key, which has the page file */
export type LastLevelRouteKey = Extract<
  RouteKey,
  | '403'
  | '404'
  | '500'
  | 'iframe-page'
  | 'login'
  | 'home'
  | 'system_menu'
  | 'system_user'
  | 'system_role'
  | 'unsupported'
>;

/** The route component, it can also be a lazy loaded component */
export type RouteComponentInput = RouteComponent | (() => Promise<RouteComponent>);

/**
 * The elegant route declaration
 *
 * Its component is a string declaration, like `layout.base$view.home`.
 */
export type ElegantConstRoute = Omit<
  _RouteRecordBase,
  'name' | 'path' | 'children' | 'component' | 'redirect'
> & {
  name: RouteKey;
  path: string;
  component?: string;
  redirect?: RouteRecordRaw['redirect'];
  children?: ElegantConstRoute[];
};

/** Get the route path by route name */
export function getRoutePath<T extends RouteKey>(name: T) {
  return routeMap[name];
}

/** Get the route name by route path */
export function getRouteName(path: RoutePath): RouteKey | null {
  const routeEntries = Object.entries(routeMap) as [RouteKey, RoutePath][];

  const routeName = routeEntries.find(([, routePath]) => routePath === path)?.[0] || null;

  return routeName;
}
