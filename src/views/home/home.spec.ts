import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';

import Home from './index.vue';

vi.mock('@/service/api', () => ({
  fetchGetHomeOverview: vi.fn(async () => ({
    data: {
      stats: [
        { key: 'users', value: 88_888, trend: '+1%', positive: true, sparkline: '0,1 2,2' },
        { key: 'orders', value: 2222, trend: '+2%', positive: true, sparkline: '0,1 2,2' },
        { key: 'revenue', value: 3333, trend: '+3%', positive: true, sparkline: '0,1 2,2' },
        { key: 'conversion', value: 4.2, trend: '-4%', positive: false, sparkline: '0,1 2,2' },
      ],
      trend: { thisWeek: [11, 12, 13, 14, 15, 16, 17], lastWeek: [1, 2, 3, 4, 5, 6, 7] },
      sources: { direct: 50, search: 25, social: 15, referral: 10 },
      creativity: { quickActions: 9, presets: 3, columns: 8 },
      totalUsers: 88_888,
    },
    error: null,
  })),
}));

async function mountHome() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'root', component: { template: '<div />' } }],
  });

  await router.push('/');
  await router.isReady();

  const wrapper = mount(Home, {
    global: {
      plugins: [router],
    },
  });

  await flushPromises();

  return wrapper;
}

describe('home page', () => {
  it('hydrates the stats and charts from the overview endpoint', async () => {
    const wrapper = await mountHome();

    const sourceChart = wrapper.findComponent({ name: 'HomeSourceChart' });
    const trendChart = wrapper.findComponent({ name: 'HomeTrendChart' });

    expect(sourceChart.props('total')).toBe(88_888);
    expect(sourceChart.props('sources')).toEqual({
      direct: 50,
      search: 25,
      social: 15,
      referral: 10,
    });
    expect(trendChart.props('thisWeek')).toEqual([11, 12, 13, 14, 15, 16, 17]);

    wrapper.unmount();
  });
});
