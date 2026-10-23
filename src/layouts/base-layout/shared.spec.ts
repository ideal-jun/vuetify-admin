import { describe, expect, it } from 'vitest';

import { getActiveTopMenu, getLayoutMenuConfig } from './shared';

const menus: App.Global.Menu[] = [
  {
    key: 'home',
    label: 'Home',
    routeKey: 'home',
    routePath: '/home',
  },
  {
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
  },
];

describe('layout menu config', () => {
  it('finds the first level menu of a route', () => {
    expect(getActiveTopMenu(menus, 'system_user')?.key).toBe('system');
    expect(getActiveTopMenu(menus, 'home')?.key).toBe('home');
    expect(getActiveTopMenu(menus, 'unknown')).toBeUndefined();
  });

  it('maps the vertical layout to the full sider menu', () => {
    const config = getLayoutMenuConfig('vertical', menus, 'system_user');

    expect(config.headerMenus).toEqual([]);
    expect(config.siderMenus).toEqual(menus);
    expect(config.showSider).toBe(true);
    expect(config.showSiderLogo).toBe(true);
    expect(config.siderMaxDepth).toBeUndefined();
  });

  it('maps the vertical mix layout to a rail and a child panel', () => {
    const config = getLayoutMenuConfig('vertical-mix', menus, 'system_user');

    expect(config.railMenus).toEqual(menus);
    expect(config.siderMenus).toEqual(menus[1]?.children);
    expect(config.isVerticalMix).toBe(true);
    expect(config.showSider).toBe(true);
  });

  it('maps the vertical hybrid layout to a first-level sider and a child header', () => {
    const config = getLayoutMenuConfig('vertical-hybrid-header-first', menus, 'system_user');

    expect(config.siderMenus).toEqual(menus);
    expect(config.siderMaxDepth).toBe(0);
    expect(config.headerMenus).toEqual(menus[1]?.children);
  });

  it('maps the horizontal layout to the top menu only', () => {
    const config = getLayoutMenuConfig('horizontal', menus, 'system_user');

    expect(config.headerMenus).toEqual(menus);
    expect(config.showSider).toBe(false);
  });

  it('maps top hybrid layouts to a top menu and a child sider', () => {
    const sidebarFirst = getLayoutMenuConfig('top-hybrid-sidebar-first', menus, 'system_user');
    const headerFirst = getLayoutMenuConfig('top-hybrid-header-first', menus, 'system_user');

    expect(sidebarFirst.headerMenus).toEqual(menus);
    expect(sidebarFirst.siderMenus).toEqual(menus[1]?.children);
    expect(headerFirst.isTopHybridHeaderFirst).toBe(true);
    expect(headerFirst.siderMenus).toEqual(menus[1]?.children);
  });

  it('hides the top hybrid sider when the active top menu has no children', () => {
    const config = getLayoutMenuConfig('top-hybrid-sidebar-first', menus, 'home');

    expect(config.siderMenus).toEqual([]);
    expect(config.showSider).toBe(false);
  });

  it('supports the active menu override', () => {
    const config = getLayoutMenuConfig('top-hybrid-sidebar-first', menus, 'some_detail', 'system');

    expect(config.siderMenus).toEqual(menus[1]?.children);
    expect(config.showSider).toBe(true);
  });
});
