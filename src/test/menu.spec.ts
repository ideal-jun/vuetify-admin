import { mount } from '@vue/test-utils';
import { setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchCreateMenu,
  fetchDeleteMenu,
  fetchGetMenuList,
  fetchUpdateMenu,
} from '@/service/api/system-manage';
import { useMenuStore } from '@/store/modules/menu';
import { setupTestAuth } from '@/test/auth';
import menuListFixture from '@/test/fixtures/ruoyi/menu-list.json';
import { pinia } from '@/test/setup';
import { waitForButton, waitForDrawer, waitForTableRows, waitForText } from '@/test/wait';
import SystemMenu from '@/views/system/menu/index.vue';

vi.mock('@/service/api/system-manage', () => ({
  fetchCreateMenu: vi.fn(),
  fetchDeleteMenu: vi.fn(),
  fetchGetMenuList: vi.fn(),
  fetchUpdateMenu: vi.fn(),
}));

const fixtureMenus = menuListFixture.data as unknown as Api.RuoYi.Menu[];

const getMenuListMock = vi.mocked(fetchGetMenuList);
const createMenuMock = vi.mocked(fetchCreateMenu);
const updateMenuMock = vi.mocked(fetchUpdateMenu);
const deleteMenuMock = vi.mocked(fetchDeleteMenu);

let rows: Api.RuoYi.Menu[] = [];
let nextMenuId = 9000;

beforeEach(async () => {
  setupTestAuth();
  setActivePinia(pinia);

  rows = structuredClone(fixtureMenus);
  nextMenuId = 9000;

  getMenuListMock.mockImplementation(async () => ({
    data: structuredClone(rows),
    error: null,
  }));

  createMenuMock.mockImplementation(async (input) => {
    rows = [...rows, { ...input, menuId: nextMenuId++ }];

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

  useMenuStore().$reset();
  await useMenuStore().loadMenus();
});

function mountPage() {
  setActivePinia(pinia);

  return mount({
    components: { SystemMenu },
    template: '<VApp><SystemMenu /></VApp>',
  });
}

describe('menu management page', () => {
  it('renders the flat RuoYi menu list as a tree table', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '系统管理');

    expect(wrapper.text()).toContain('菜单列表');
    expect(wrapper.findAll('tbody tr')).toHaveLength(14);
    expect(wrapper.text()).toContain('目录');
    expect(wrapper.text()).toContain('菜单');
    expect(wrapper.text()).toContain('按钮');

    await wrapper.find('button[aria-label="收起"]').trigger('click');

    // The collapsed directory stays visible, only its descendants are hidden.
    await waitForTableRows(wrapper, 4);

    await wrapper.find('button[aria-label="展开"]').trigger('click');

    await waitForTableRows(wrapper, 14);

    wrapper.unmount();
  });

  it('creates a menu from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 14);

    const addButton = await waitForButton(wrapper, '新增');

    await addButton.trigger('click');

    const drawer = await waitForDrawer(wrapper, '新增菜单');

    await drawer.find('input[placeholder="请输入菜单名称"]').setValue('报表管理');
    await drawer.find('input[placeholder="请输入路由路径"]').setValue('/report');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    expect(confirmButton).toBeDefined();

    await confirmButton?.trigger('click');

    await waitForTableRows(wrapper, 15);

    expect(wrapper.text()).toContain('报表管理');
    expect(createMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        menuName: '报表管理',
        parentId: 0,
        menuType: 'C',
        path: '/report',
        status: '0',
      }),
    );

    wrapper.unmount();
  });

  it('creates a button under a menu from the row action', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 14);

    const userRow = wrapper.findAll('tbody tr').find((row) => row.text().includes('用户管理'));

    expect(userRow).toBeDefined();

    const addButton = userRow?.find('button[aria-label="新增按钮"]');

    expect(addButton).toBeDefined();

    await addButton?.trigger('click');

    const drawer = await waitForDrawer(wrapper, '新增按钮');

    expect(drawer.find('input[placeholder="请输入路由路径"]').exists()).toBe(false);
    expect(drawer.find('input[placeholder="如 system:user:add"]').exists()).toBe(true);

    await drawer.find('input[placeholder="请输入菜单名称"]').setValue('导出用户');
    await drawer.find('input[placeholder="如 system:user:add"]').setValue('system:report:export');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    expect(confirmButton).toBeDefined();

    await confirmButton?.trigger('click');

    await waitForTableRows(wrapper, 15);

    expect(wrapper.text()).toContain('导出用户');
    expect(wrapper.text()).toContain('system:report:export');
    expect(createMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        menuName: '导出用户',
        parentId: 100,
        menuType: 'F',
        perms: 'system:report:export',
      }),
    );

    wrapper.unmount();
  });
});
