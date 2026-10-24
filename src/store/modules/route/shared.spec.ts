import { describe, expect, it } from 'vitest';

import type { ElegantConstRoute, RouteKey } from '@/router/route-key';

import { isRouteExistByRouteName, isRouteExistByRoutePath } from './shared';

/** A backend style route tree, its paths are not part of the static route map */
const routes: ElegantConstRoute[] = [
  {
    name: 'system',
    path: '/system',
    children: [
      {
        name: 'system_user',
        path: '/system/user',
        children: [{ name: 'system_user_detail' as RouteKey, path: '/system/user/detail' }],
      },
    ],
  },
  { name: 'backend_page' as RouteKey, path: '/backend/page' },
];

describe('route existence helpers', () => {
  it('finds a route by its name', () => {
    expect(isRouteExistByRouteName('system_user', routes)).toBe(true);
    expect(isRouteExistByRouteName('backend_page' as RouteKey, routes)).toBe(true);
    expect(isRouteExistByRouteName('missing' as RouteKey, routes)).toBe(false);
  });

  it('finds a route by its path, as the fallback for backend routes', () => {
    expect(isRouteExistByRoutePath('/backend/page', routes)).toBe(true);
    expect(isRouteExistByRoutePath('/system/user/detail', routes)).toBe(true);
    expect(isRouteExistByRoutePath('/system/user/missing', routes)).toBe(false);
  });
});
