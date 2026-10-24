import type {
  LocationQueryRaw,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
} from 'vue-router';

import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';

import type { RouteKey, RoutePath } from '../route-key';
import { getRouteName } from '../route-key';

/**
 * Create the route guard
 *
 * @param router Router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const location = await initRoute(to);

    if (location) {
      return location;
    }

    const authStore = useAuthStore();

    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const noAuthorizationRoute: RouteKey = '403';

    const isLogin = Boolean(localStg.get('token'));
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];

    const hasRole = authStore.userInfo.roles.some((role) => routeRoles.includes(role));
    const hasAuth = authStore.isStaticSuper || routeRoles.length === 0 || hasRole;

    // If it is the login route when logged in, switch to the root page
    if (to.name === loginRoute && isLogin) {
      return { name: rootRoute };
    }

    // If the route does not need login, it is allowed to access directly
    if (!needLogin) {
      return handleRouteSwitch(to, from);
    }

    // The route needs login but the user is not logged in, switch to the login page
    if (!isLogin) {
      return { name: loginRoute, query: { redirect: to.fullPath } };
    }

    // If the user is logged in but does not have authorization, switch to the 403 page
    if (!hasAuth) {
      return { name: noAuthorizationRoute };
    }

    return handleRouteSwitch(to, from);
  });
}

/**
 * Initialize the route
 *
 * @param to To route
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // If the constant route is not initialized, initialize it
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // The route is captured by the "not-found" route because the constant route is not initialized.
    // After the constant route is initialized, redirect to the original route.
    return {
      path: to.fullPath,
      replace: true,
      query: to.query,
      hash: to.hash,
    };
  }

  const isLogin = Boolean(localStg.get('token'));

  if (!isLogin) {
    // If the user is not logged in and the route is a constant route but not the "not-found" route,
    // it is allowed to access.
    if (to.meta.constant && !isNotFoundRoute) {
      void routeStore.onRouteSwitchWhenNotLoggedIn();

      return null;
    }

    // If the user is not logged in, switch to the login page
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    return {
      name: loginRoute,
      query,
    };
  }

  if (!routeStore.isInitAuthRoute) {
    await routeStore.initAuthRoute();

    // The route is captured by the "not-found" route because the auth route is not initialized.
    // After the auth route is initialized, redirect to the original route.
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      return {
        path,
        replace: true,
        query: to.query,
        hash: to.hash,
      };
    }
  }

  void routeStore.onRouteSwitchWhenLoggedIn();

  // The auth route is initialized and it is not the "not-found" route, it is allowed to access
  if (!isNotFoundRoute) {
    return null;
  }

  // It is captured by the "not-found" route, check whether the route exists
  const exist = await routeStore.getIsAuthRouteExist(to.path);

  if (exist) {
    return { name: '403' };
  }

  return null;
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  // Route with an external href
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');

    return { path: from.fullPath, replace: true, query: from.query, hash: to.hash };
  }

  return undefined;
}

function getRouteQueryOfLoginRoute(
  to: RouteLocationNormalized,
  routeHome: RouteKey,
): LocationQueryRaw {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath = '', redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}
