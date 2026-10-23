import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { setupTestAuth } from '@/test/auth';
import SystemUser from '@/views/system/user/index.vue';

function mountPage() {
  return mount({
    components: { SystemUser },
    template: '<VApp><SystemUser /></VApp>',
  });
}

async function waitForMock() {
  // The mock service returns after a short delay; a submit triggers two sequential requests.
  await new Promise((resolve) => {
    setTimeout(resolve, 700);
  });
  await flushPromises();
}

describe('user management page', () => {
  beforeEach(() => {
    setupTestAuth();
  });

  it('renders the search panel and the paginated user table', async () => {
    const wrapper = mountPage();

    await waitForMock();

    expect(wrapper.text()).toContain('用户列表');
    expect(wrapper.text()).toContain('第 1-10 条，共 28 条');
    expect(wrapper.text()).toContain('Xavier');
    expect(wrapper.findAll('tbody tr')).toHaveLength(10);

    wrapper.unmount();
  });

  it('hides delete actions when the user lacks the delete permission', async () => {
    setupTestAuth({
      buttons: ['system:user:view', 'system:user:add', 'system:user:edit'],
      roles: ['R_ADMIN'],
    });

    const wrapper = mountPage();

    await waitForMock();

    expect(wrapper.findAll('button[aria-label="删除"]')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('批量删除');
    expect(wrapper.findAll('button').some((button) => button.text().trim() === '新增')).toBe(true);

    wrapper.unmount();
  });

  it('creates a user from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForMock();

    const addButton = wrapper.findAll('button').find((button) => button.text().trim() === '新增');

    expect(addButton).toBeDefined();

    await addButton?.trigger('click');
    await nextTick();

    const drawer = wrapper
      .findAll('.v-navigation-drawer')
      .find((item) => item.text().includes('新增用户'));

    if (!drawer) {
      throw new Error('the operate drawer is not rendered');
    }

    const userNameInput = drawer.find('input[placeholder="请输入用户名"]');

    await userNameInput.setValue('TestUser');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    await confirmButton?.trigger('click');
    await waitForMock();

    expect(wrapper.text()).toContain('第 1-10 条，共 29 条');
    expect(wrapper.text()).toContain('TestUser');

    wrapper.unmount();
  });
});
