import { layouts, views } from '../elegant/imports';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';
import type { ElegantConstRoute } from '../route-key';
import { getRoutePath } from '../route-key';

export const ROOT_ROUTE: ElegantConstRoute = {
  name: 'root',
  path: '/',
  redirect: getRoutePath(import.meta.env.VITE_ROUTE_HOME || 'home') || '/home',
  meta: {
    title: 'root',
    constant: true,
  },
};

export const NOT_FOUND_ROUTE: ElegantConstRoute = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  component: 'layout.blank$view.404',
  meta: {
    title: 'not-found',
    i18nKey: 'route.not-found',
    constant: true,
    hideInMenu: true,
  },
};

/** Builtin routes, they must be constant and setup in vue-router */
const builtinRoutes: ElegantConstRoute[] = [ROOT_ROUTE, NOT_FOUND_ROUTE];

/** Create builtin vue routes */
export function createBuiltinVueRoutes() {
  return transformElegantRoutesToVueRoutes(builtinRoutes, layouts, views);
}
