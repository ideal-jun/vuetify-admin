import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchForceLogout, fetchGetOnlineList } from '@/service/api/monitor-online';
import { setupTestAuth } from '@/test/auth';
import { waitForTableRows, waitForText } from '@/test/wait';
import MonitorOnline from '@/views/monitor/online/index.vue';

vi.mock('@/service/api/monitor-online', () => ({
  fetchGetOnlineList: vi.fn(),
  fetchForceLogout: vi.fn(),
}));

const onlineUsers: Api.MonitorOnline.OnlineUser[] = [
  {
    tokenId: 'token-1',
    userName: 'admin',
    deptName: '研发部门',
    ipaddr: '127.0.0.1',
    loginLocation: '内网IP',
    browser: 'Chrome',
    os: 'Windows 10',
    loginTime: 1_792_000_000_000,
  },
  {
    tokenId: 'token-2',
    userName: 'ry',
    deptName: '测试部门',
    ipaddr: '192.168.1.10',
    loginLocation: '内网IP',
    browser: 'Edge',
    os: 'Windows 11',
    loginTime: 1_792_000_100_000,
  },
];

const getOnlineListMock = vi.mocked(fetchGetOnlineList);
const forceLogoutMock = vi.mocked(fetchForceLogout);

beforeEach(() => {
  setupTestAuth();

  getOnlineListMock.mockResolvedValue({
    data: {
      code: 200,
      msg: '查询成功',
      total: onlineUsers.length,
      rows: onlineUsers,
    },
    error: null,
  });

  forceLogoutMock.mockResolvedValue({ data: null, error: null });

  // Auto-confirm the feedback dialog so the force logout interaction can be tested.
  window.$dialog = {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn((options: App.Global.DialogOptions) => {
      void options.onPositiveClick?.();
    }),
    error: vi.fn(),
  };
});

afterEach(() => {
  window.$dialog = undefined;
});

function mountPage() {
  return mount({
    components: { MonitorOnline },
    template: '<VApp><MonitorOnline /></VApp>',
  });
}

describe('online users page', () => {
  it('renders the backend online sessions', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('在线用户');
    expect(wrapper.text()).toContain('token-1');
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('研发部门');
    expect(wrapper.text()).toContain('127.0.0.1');
    expect(wrapper.text()).toContain('Chrome');
    expect(wrapper.text()).toContain('Windows 10');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('forces a session to log out from the row action', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 2);

    const logoutButton = wrapper.find('button[aria-label="强退"]');

    expect(logoutButton.exists()).toBe(true);

    await logoutButton.trigger('click');

    await vi.waitFor(() => {
      expect(forceLogoutMock).toHaveBeenCalledWith('token-1');
    });
    expect(getOnlineListMock).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });
});
