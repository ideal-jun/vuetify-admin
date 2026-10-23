import { describe, expect, it } from 'vitest';

import { getFirstLeafPath, isMenuActive } from './shared';

const systemMenu: App.Global.Menu = {
  key: 'system',
  label: 'System',
  routeKey: 'system',
  routePath: '/system',
  children: [
    {
      key: 'system_user',
      label: 'Users',
      routeKey: 'system_user',
      routePath: '/system/user',
    },
  ],
};

describe('menu helpers', () => {
  it('resolves the first navigable route of a menu tree', () => {
    expect(getFirstLeafPath(systemMenu)).toBe('/system/user');
    expect(getFirstLeafPath(systemMenu.children![0]!)).toBe('/system/user');
  });

  it('matches the current route by key, child key or active menu', () => {
    expect(isMenuActive(systemMenu, 'system')).toBe(true);
    expect(isMenuActive(systemMenu, 'system_user')).toBe(true);
    expect(isMenuActive(systemMenu, 'home', 'system')).toBe(true);
    expect(isMenuActive(systemMenu, 'home')).toBe(false);
  });
});
