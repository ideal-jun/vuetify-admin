import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useMenuStore } from './index';

describe('useMenuStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loads, creates, updates, toggles and removes menus', async () => {
    const store = useMenuStore();

    await store.loadMenus();

    expect(store.flatMenus.map((menu) => menu.id)).toContain('system-menu');

    store.createMenu({
      title: '用户管理',
      path: '/system/user',
      icon: 'mdi-account',
      permission: '',
      type: 'menu',
      parentId: 'system',
      sort: 2,
      status: 'enabled',
    });

    const created = store.flatMenus.find((menu) => menu.title === '用户管理');

    expect(created?.parentId).toBe('system');

    if (!created) {
      throw new Error('menu was not created');
    }

    store.updateMenu(created.id, {
      ...created,
      title: '用户管理 2',
      path: '/system/user-2',
    });

    expect(store.flatMenus.find((menu) => menu.id === created.id)?.title).toBe('用户管理 2');

    store.toggleStatus(created.id);

    expect(store.flatMenus.find((menu) => menu.id === created.id)?.status).toBe('disabled');

    store.removeMenu(created.id);

    expect(store.flatMenus.find((menu) => menu.id === created.id)).toBeUndefined();

    await store.reloadMenus();

    expect(store.flatMenus.find((menu) => menu.id === 'system-menu')).toBeDefined();
  });
});
