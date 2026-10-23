import { layouts, views } from '../elegant/imports';
import { generatedRoutes } from '../elegant/routes';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';
import type { ElegantConstRoute } from '../route-key';

/**
 * Custom routes
 *
 * They are defined by the application itself and cannot be generated from files.
 */
const customRoutes: ElegantConstRoute[] = [];

/** Create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantConstRoute[] = [];

  const authRoutes: ElegantConstRoute[] = [];

  for (const item of [...customRoutes, ...generatedRoutes]) {
    if (item.meta?.constant) {
      constantRoutes.push(item);
    } else {
      authRoutes.push(item);
    }
  }

  return {
    constantRoutes,
    authRoutes,
  };
}

/** Get auth vue routes */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views);
}
