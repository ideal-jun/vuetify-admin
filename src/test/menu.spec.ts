import { flushPromises, mount } from '@vue/test-utils';
import { setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { setupTestAuth } from '@/test/auth';
import { pinia } from '@/test/setup';
import SystemMenu from '@/views/system/menu/index.vue';

function mountPage() {
  setActivePinia(pinia);

  return mount({
    components: { SystemMenu },
    template: '<VApp><SystemMenu /></VApp>',
  });
}

async function waitForStore() {
  await new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
  await flushPromises();
}

describe('menu management page', () => {
  beforeEach(() => {
    setupTestAuth();
  });

  it('renders the search panel and the menu table', async () => {
    const wrapper = mountPage();

    await waitForStore();

    expect(wrapper.text()).toContain('菜单列表');
    expect(wrapper.text()).toContain('系统管理');
    expect(wrapper.findAll('tbody tr')).toHaveLength(8);

    await wrapper.find('button[aria-label="收起"]').trigger('click');
    await nextTick();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    await wrapper.find('button[aria-label="展开"]').trigger('click');
    await nextTick();

    expect(wrapper.findAll('tbody tr')).toHaveLength(8);

    wrapper.unmount();
  });

  it('creates a menu from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForStore();

    const addButton = wrapper.findAll('button').find((button) => button.text().trim() === '新增');

    expect(addButton).toBeDefined();

    await addButton?.trigger('click');
    await nextTick();

    const drawer = wrapper
      .findAll('.v-navigation-drawer')
      .find((item) => item.text().includes('新增菜单'));

    if (!drawer) {
      throw new Error('the menu drawer is not rendered');
    }

    await drawer.find('input[placeholder="请输入菜单名称"]').setValue('报表管理');
    await drawer.find('input[placeholder="请输入路由路径"]').setValue('/report');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    await confirmButton?.trigger('click');
    await waitForStore();

    expect(wrapper.findAll('tbody tr')).toHaveLength(9);
    expect(wrapper.text()).toContain('报表管理');

    wrapper.unmount();
  });

  it('creates a button under a menu from the row action', async () => {
    const wrapper = mountPage();

    await waitForStore();

    expect(wrapper.findAll('tbody tr')).toHaveLength(9);

    const userRow = wrapper.findAll('tbody tr').find((row) => row.text().includes('用户管理'));

    const addButton = userRow?.find('button[aria-label="新增按钮"]');

    expect(addButton).toBeDefined();

    await addButton?.trigger('click');
    await nextTick();

    const drawer = wrapper
      .findAll('.v-navigation-drawer')
      .find((item) => item.text().includes('新增按钮'));

    if (!drawer) {
      throw new Error('the button drawer is not rendered');
    }

    expect(drawer.find('input[placeholder="请输入路由路径"]').exists()).toBe(false);
    expect(drawer.find('input[placeholder="如 system:user:add"]').exists()).toBe(true);

    await drawer.find('input[placeholder="请输入菜单名称"]').setValue('导出用户');
    await drawer.find('input[placeholder="如 system:user:add"]').setValue('system:report:export');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    await confirmButton?.trigger('click');
    await waitForStore();

    expect(wrapper.findAll('tbody tr')).toHaveLength(10);
    expect(wrapper.text()).toContain('导出用户');
    expect(wrapper.text()).toContain('system:report:export');
    expect(wrapper.text()).toContain('按钮');

    wrapper.unmount();
  });
});
