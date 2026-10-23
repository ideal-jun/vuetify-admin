import { describe, expect, it } from 'vitest';

import { getTabByRoute, getTabIdByRoute } from './shared';

function createRoute(meta: Partial<App.Global.TabRoute['meta']> = {}): App.Global.TabRoute {
  return {
    name: 'system_menu',
    path: '/system/menu',
    fullPath: '/system/menu?current=1',
    query: { current: '1' },
    meta: {
      title: 'system_menu',
      i18nKey: 'route.system_menu',
      icon: 'mdi-menu',
      ...meta,
    },
  };
}

describe('tab shared helpers', () => {
  it('uses the path as tab id by default', () => {
    expect(getTabIdByRoute(createRoute())).toBe('/system/menu');
  });

  it('uses the sorted query as tab id for multi tab routes', () => {
    expect(getTabIdByRoute(createRoute({ multiTab: true }))).toBe('/system/menu?current=1');
  });

  it('creates a tab with the localized label', () => {
    const tab = getTabByRoute(createRoute());

    expect(tab.label).toBe('菜单管理');
    expect(tab.icon).toBe('mdi-menu');
    expect(tab.routeKey).toBe('system_menu');
  });
});
