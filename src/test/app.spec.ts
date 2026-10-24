import { mount } from '@vue/test-utils';
import { setActivePinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';

import App from '@/App.vue';
import { env } from '@/env';
import { router, setupBuiltinRoutes } from '@/router';
import { createRouterGuard } from '@/router/guard';
import { useAuthStore } from '@/store/modules/auth';
import getInfoFixture from '@/test/fixtures/backend/get-info.json';
import getRoutersFixture from '@/test/fixtures/backend/get-routers.json';
import roleOptionFixture from '@/test/fixtures/backend/role-option.json';
import userListFixture from '@/test/fixtures/backend/user-list.json';
import { pinia } from '@/test/setup';
import { waitForText } from '@/test/wait';
import { localStg } from '@/utils/storage';

vi.mock('@/service/api', () => ({
  fetchGetHomeOverview: vi.fn(async () => ({
    data: {
      stats: [
        { key: 'users', value: 2, trend: '+1%', positive: true, sparkline: '0,1 2,2' },
        { key: 'orders', value: 20, trend: '+2%', positive: true, sparkline: '0,1 2,2' },
        { key: 'revenue', value: 300, trend: '+3%', positive: true, sparkline: '0,1 2,2' },
        { key: 'conversion', value: 4.2, trend: '-4%', positive: false, sparkline: '0,1 2,2' },
      ],
      trend: { thisWeek: [11, 12, 13, 14, 15, 16, 17], lastWeek: [1, 2, 3, 4, 5, 6, 7] },
      sources: { direct: 50, search: 25, social: 15, referral: 10 },
      creativity: { quickActions: 9, presets: 3, columns: 8 },
      totalUsers: 2,
    },
    error: null,
  })),
  fetchGetCaptcha: vi.fn(async () => ({
    data: {
      code: 200,
      msg: '操作成功',
      img: 'captcha-image',
      uuid: 'captcha-uuid',
      captchaEnabled: true,
    },
    error: null,
  })),
  fetchLogin: vi.fn(async () => ({
    data: { access_token: 'test-token', expires_in: 7200 },
    error: null,
  })),
  fetchGetUserInfo: vi.fn(async () => ({ data: getInfoFixture, error: null })),
  fetchGetRouters: vi.fn(async () => ({ data: getRoutersFixture.data, error: null })),
  fetchGetUserList: vi.fn(async () => ({
    data: {
      code: 200,
      msg: '查询成功',
      total: userListFixture.total,
      rows: userListFixture.rows,
    },
    error: null,
  })),
  fetchGetAllRoles: vi.fn(async () => ({ data: roleOptionFixture.data, error: null })),
  fetchRefreshToken: vi.fn(async () => ({ data: null, error: null })),
  fetchLogout: vi.fn(async () => ({ data: null, error: null })),
}));

describe('App integration', () => {
  it('renders the dynamic backend menu, logs in and opens the mapped pages', async () => {
    localStg.remove('token');
    localStg.remove('lastLoginUserId');
    localStg.remove('globalTabs');

    setActivePinia(pinia);

    setupBuiltinRoutes();
    createRouterGuard(router);

    await router.push('/home').catch(() => undefined);

    const wrapper = mount(App, {
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await waitForText(wrapper, '欢迎回来');

    expect(wrapper.text()).toContain('用户总数');
    expect(wrapper.text()).toContain('首页');

    // The login page loads the backend captcha and must redirect back to the home page after login.
    await router.push('/login');

    await vi.waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/login');
    });

    await waitForText(wrapper, '请输入验证码');

    const authStore = useAuthStore();

    await authStore.login('admin', env.defaultUserPassword, { code: '1234', uuid: 'captcha-uuid' });

    await vi.waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/home');
    });

    // The dynamic getRouters tree registers the backend menus.
    await waitForText(wrapper, '系统管理');

    // The supported view is mapped to the template page.
    await router.push('/system/user');

    await waitForText(wrapper, '用户列表');
    expect(wrapper.text()).toContain('第 1-2 条，共 2 条');

    // A backend page without a view falls back to the placeholder.
    await router.push('/system/dept');

    await waitForText(wrapper, '部门管理');
    // The placeholder keeps the backend title and explains that the page is not implemented yet.
    expect(wrapper.text()).toContain('当前还没有对应页面');

    // The root path redirects to the configured home route.
    await router.push('/');

    await vi.waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/home');
    });

    wrapper.unmount();
  });
});
