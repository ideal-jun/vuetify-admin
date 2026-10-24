import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchCreateMenu,
  fetchDeleteMenu,
  fetchGetMenuList,
  fetchUpdateMenu,
} from '@/service/api/system-manage';
import menuListFixture from '@/test/fixtures/ruoyi/menu-list.json';

import { useMenuStore } from './index';

vi.mock('@/service/api/system-manage', () => ({
  fetchCreateMenu: vi.fn(),
  fetchDeleteMenu: vi.fn(),
  fetchGetMenuList: vi.fn(),
  fetchUpdateMenu: vi.fn(),
}));

const menuRows = menuListFixture.data as unknown as Api.RuoYi.Menu[];

const getMenuListMock = vi.mocked(fetchGetMenuList);
const createMenuMock = vi.mocked(fetchCreateMenu);
const updateMenuMock = vi.mocked(fetchUpdateMenu);
const deleteMenuMock = vi.mocked(fetchDeleteMenu);

let rows: Api.RuoYi.Menu[] = [];
let nextMenuId = 9000;

function cloneRows() {
  return structuredClone(rows);
}

beforeEach(() => {
  setActivePinia(createPinia());

  rows = structuredClone(menuRows);
  nextMenuId = 9000;

  getMenuListMock.mockImplementation(async () => ({
    data: cloneRows(),
    error: null,
  }));

  createMenuMock.mockImplementation(async (input) => {
    rows = [
      ...rows,
      {
        ...input,
        menuId: nextMenuId++,
        visible: input.visible ?? '0',
        status: input.status ?? '0',
      },
    ];

    return { data: null, error: null };
  });

  updateMenuMock.mockImplementation(async (input) => {
    rows = rows.map((row) => (row.menuId === input.menuId ? { ...row, ...input } : row));

    return { data: null, error: null };
  });

  deleteMenuMock.mockImplementation(async (menuId) => {
    rows = rows.filter((row) => row.menuId !== menuId);

    return { data: null, error: null };
  });
});

describe('useMenuStore', () => {
  it('loads the flat RuoYi menu rows and computes the tree depth', async () => {
    const store = useMenuStore();

    await store.loadMenus();

    expect(getMenuListMock).toHaveBeenCalledTimes(1);
    expect(store.isLoaded).toBe(true);
    expect(store.isLoading).toBe(false);
    expect(store.menus).toHaveLength(14);
    expect(store.flatMenus.find((menu) => menu.menuId === 1)?.depth).toBe(0);
    expect(store.flatMenus.find((menu) => menu.menuId === 100)?.depth).toBe(1);
    expect(store.flatMenus.find((menu) => menu.menuId === 1000)?.depth).toBe(2);
    expect(store.flatMenus.find((menu) => menu.menuId === 1039)?.depth).toBe(3);
    // RuoYi returns roots first and then all children; the store must flatten it depth-first.
    expect(store.flatMenus.map((menu) => menu.menuId)).toEqual([
      1, 100, 1000, 1001, 1002, 1003, 101, 102, 108, 500, 1039, 2, 3, 4,
    ]);
  });

  it('creates, updates, toggles and removes a menu through the service', async () => {
    const store = useMenuStore();

    await store.loadMenus();

    const created = await store.createMenu({
      menuName: '报表管理',
      parentId: 1,
      orderNum: 9,
      path: 'report',
      component: null,
      menuType: 'C',
      visible: '0',
      status: '0',
      perms: '',
      icon: 'mdi-chart-box',
    });

    expect(created).toBe(true);
    expect(createMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({ menuName: '报表管理', parentId: 1, menuType: 'C' }),
    );

    const createdRow = store.flatMenus.find((menu) => menu.menuName === '报表管理');

    expect(createdRow?.menuId).toBe(9000);
    expect(createdRow?.depth).toBe(1);

    if (!createdRow) {
      throw new Error('the menu was not created');
    }

    expect(await store.updateMenu({ ...createdRow, menuName: '报表管理 2' })).toBe(true);
    expect(store.flatMenus.find((menu) => menu.menuId === createdRow.menuId)?.menuName).toBe(
      '报表管理 2',
    );

    expect(await store.toggleStatus(createdRow.menuId)).toBe(true);
    expect(updateMenuMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ menuId: createdRow.menuId, status: '1' }),
    );
    expect(store.flatMenus.find((menu) => menu.menuId === createdRow.menuId)?.status).toBe('1');

    expect(await store.removeMenu(createdRow.menuId)).toBe(true);
    expect(store.flatMenus.find((menu) => menu.menuId === createdRow.menuId)).toBeUndefined();
  });

  it('keeps the store empty when the menu list cannot be loaded', async () => {
    getMenuListMock.mockResolvedValueOnce({
      data: null,
      error: { code: '500', message: 'failed' },
    });

    const store = useMenuStore();

    await store.loadMenus();

    expect(store.menus).toEqual([]);
    expect(store.isLoaded).toBe(false);
    expect(store.isLoading).toBe(false);
  });
});
