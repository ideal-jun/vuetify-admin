import { describe, expect, it } from 'vitest';

import { createStaticRoutes, getAuthVueRoutes } from './index';

describe('route transform', () => {
  it('splits the generated routes into constant and auth routes', () => {
    const { constantRoutes, authRoutes } = createStaticRoutes();

    expect(constantRoutes.map((route) => route.name)).toContain('home');
    expect(constantRoutes.map((route) => route.name)).toContain('login');
    expect(authRoutes.map((route) => route.name)).toContain('system');
    expect(
      authRoutes.find((route) => route.name === 'system')?.children?.map((route) => route.name),
    ).toEqual(['system_menu', 'system_user', 'system_role']);
  });

  it('resolves layout and view declarations into vue routes', () => {
    const { constantRoutes } = createStaticRoutes();
    const vueRoutes = getAuthVueRoutes(constantRoutes);

    const homeRoute = vueRoutes.find((route) => route.path === '/home');

    expect(homeRoute).toBeDefined();
    expect(homeRoute?.children?.[0]?.name).toBe('home');
    expect(homeRoute?.children?.[0]?.component).toBeTypeOf('function');
  });
});
