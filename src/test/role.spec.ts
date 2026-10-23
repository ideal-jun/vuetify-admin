import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { setupTestAuth } from '@/test/auth';
import SystemRole from '@/views/system/role/index.vue';

function mountPage() {
  return mount({
    components: { SystemRole },
    template: '<VApp><SystemRole /></VApp>',
  });
}

async function waitForMock() {
  await new Promise((resolve) => {
    setTimeout(resolve, 700);
  });
  await flushPromises();
}

describe('role management page', () => {
  beforeEach(() => {
    setupTestAuth();
  });

  it('renders the search panel and the role table', async () => {
    const wrapper = mountPage();

    await waitForMock();

    expect(wrapper.text()).toContain('角色列表');
    expect(wrapper.text()).toContain('第 1-4 条，共 4 条');
    expect(wrapper.text()).toContain('Super Admin');
    expect(wrapper.findAll('tbody tr')).toHaveLength(4);

    wrapper.unmount();
  });

  it('creates a role from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForMock();

    const addButton = wrapper.findAll('button').find((button) => button.text().trim() === '新增');

    expect(addButton).toBeDefined();

    await addButton?.trigger('click');
    await nextTick();

    const drawer = wrapper
      .findAll('.v-navigation-drawer')
      .find((item) => item.text().includes('新增角色'));

    if (!drawer) {
      throw new Error('the role drawer is not rendered');
    }

    await drawer.find('input[placeholder="请输入角色名称"]').setValue('Auditor');
    await drawer.find('input[placeholder="如 R_ADMIN"]').setValue('R_AUDITOR');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    await confirmButton?.trigger('click');
    await waitForMock();

    expect(wrapper.text()).toContain('第 1-5 条，共 5 条');
    expect(wrapper.text()).toContain('Auditor');

    wrapper.unmount();
  });
});
