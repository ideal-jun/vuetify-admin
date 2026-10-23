import { flushPromises, mount } from '@vue/test-utils';
import { setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import App from '@/App.vue';
import { router, setupBuiltinRoutes } from '@/router';
import { createRouterGuard } from '@/router/guard';
import { useAuthStore } from '@/store/modules/auth';
import { pinia } from '@/test/setup';
import { localStg } from '@/utils/storage';

describe('App integration', () => {
  it('renders the home page, logs in and redirects to home', async () => {
    localStg.remove('token');
    localStg.remove('refreshToken');
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

    await flushPromises();
    await nextTick();
    await flushPromises();

    expect(wrapper.text()).toContain('欢迎回来');
    expect(wrapper.text()).toContain('用户总数');
    expect(wrapper.text()).toContain('首页');
    expect(wrapper.text()).toContain('主题设置');

    // The login page must redirect back to the home page after a successful login.
    await router.push('/login');
    await flushPromises();

    const authStore = useAuthStore();

    await authStore.login('admin', '123456');
    await flushPromises();
    await nextTick();

    expect(router.currentRoute.value.path).toBe('/home');
    expect(wrapper.text()).toContain('系统管理');

    // The root path redirects to the configured home route.
    await router.push('/');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/home');

    wrapper.unmount();
  });
});
