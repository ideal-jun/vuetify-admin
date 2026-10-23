import { generatedRoutes } from '@/router/elegant/routes';
import type { ElegantConstRoute } from '@/router/route-key';
import { jsonClone, sleep } from '@/utils/common';
import { localStg } from '@/utils/storage';

import { getMockUserByToken, handleAuthMockRequest } from './auth';
import { handleHomeMockRequest } from './home';
import { handleSystemManageMockRequest } from './system-manage';

const MOCK_DELAY = 260;

function createMockResponse<T>(data: T): App.Service.FlatResponseData<T> {
  return { data, error: null };
}

function createMockError(code: string, message: string): App.Service.FlatResponseData<never> {
  return {
    data: null,
    error: {
      code,
      message,
    },
  };
}

function isSuccess<T>(
  response: App.Service.FlatResponseData<T>,
): response is { data: T; error: null } {
  return response.error === null;
}

function isRouteExistByName(routeName: string, routes: ElegantConstRoute[]): boolean {
  return routes.some((route) => {
    if (route.name === routeName) {
      return true;
    }

    return route.children ? isRouteExistByName(routeName, route.children) : false;
  });
}

function filterAuthRoutesByRoles(routes: ElegantConstRoute[], roles: string[]) {
  return routes.flatMap((route) => {
    const routeRoles = route.meta?.roles || [];
    const isEmptyRoles = routeRoles.length === 0;
    const hasPermission = routeRoles.some((role) => roles.includes(role));

    const filteredRoute = jsonClone(route);

    if (filteredRoute.children?.length) {
      filteredRoute.children = filterAuthRoutesByRoles(filteredRoute.children, roles);
    }

    if (filteredRoute.children && filteredRoute.children.length === 0) {
      return [];
    }

    return hasPermission || isEmptyRoles ? [filteredRoute] : [];
  });
}

function toMenuRoutes(routes: ElegantConstRoute[]): Api.Route.MenuRoute[] {
  return routes.map((route) => {
    const menuRoute = {
      ...jsonClone(route),
      id: route.name,
    } as Api.Route.MenuRoute;

    if (route.children?.length) {
      menuRoute.children = toMenuRoutes(route.children);
    }

    return menuRoute;
  });
}

/**
 * The built-in mock backend
 *
 * It implements the endpoints used by the template so the app can run without any backend.
 */
export async function handleMockRequest<T>(
  config: App.Service.RequestConfig,
): Promise<App.Service.FlatResponseData<T>> {
  await sleep(MOCK_DELAY);

  const method = config.method || 'GET';
  const path = config.url;

  const authResponse = handleAuthMockRequest(config);

  if (authResponse) {
    return authResponse as App.Service.FlatResponseData<T>;
  }

  if (method === 'GET' && path === '/route/getConstantRoutes') {
    const constantRoutes = generatedRoutes.filter((route) => route.meta?.constant);

    return createMockResponse(toMenuRoutes(constantRoutes)) as App.Service.FlatResponseData<T>;
  }

  if (method === 'GET' && path === '/route/getUserRoutes') {
    const user = getMockUserByToken(localStg.get('token'));

    if (!user) {
      return createMockError(
        '8888',
        'The login status has expired',
      ) as App.Service.FlatResponseData<T>;
    }

    const authRoutes = generatedRoutes.filter((route) => !route.meta?.constant);

    const allowedRoutes = user.roles.includes(import.meta.env.VITE_STATIC_SUPER_ROLE)
      ? authRoutes
      : filterAuthRoutesByRoles(authRoutes, user.roles);

    const response: Api.Route.UserRoute = {
      routes: toMenuRoutes(allowedRoutes),
      home: (import.meta.env.VITE_ROUTE_HOME || 'home') as Api.Route.UserRoute['home'],
    };

    return createMockResponse(response) as App.Service.FlatResponseData<T>;
  }

  if (method === 'GET' && path === '/route/isRouteExist') {
    const routeName = String(config.params?.routeName || '');

    return createMockResponse(
      isRouteExistByName(routeName, generatedRoutes),
    ) as App.Service.FlatResponseData<T>;
  }

  const homeResponse = handleHomeMockRequest(config);

  if (homeResponse) {
    return homeResponse as App.Service.FlatResponseData<T>;
  }

  const systemManageResponse = handleSystemManageMockRequest(config);

  if (systemManageResponse) {
    return systemManageResponse as App.Service.FlatResponseData<T>;
  }

  return createMockError(
    '404',
    `Mock api not found: ${method} ${path}`,
  ) as App.Service.FlatResponseData<T>;
}

export { isSuccess };
