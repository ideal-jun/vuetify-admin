import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGetLogininforList, fetchUnlockLogininfor } from '@/service/api/system-logininfor';
import { setupTestAuth } from '@/test/auth';
import { waitForText } from '@/test/wait';
import SystemLogininfor from '@/views/system/logininfor/index.vue';

vi.mock('@/service/api/system-logininfor', () => ({
  fetchCleanLogininfors: vi.fn(),
  fetchDeleteLogininfors: vi.fn(),
  fetchGetLogininforList: vi.fn(),
  fetchUnlockLogininfor: vi.fn(),
}));

const logininfors: Api.SystemLogininfor.Logininfor[] = [
  {
    infoId: 1,
    userName: 'admin',
    ipaddr: '127.0.0.1',
    loginLocation: '内网IP',
    browser: 'Chrome',
    os: 'Windows 10',
    status: '0',
    msg: '登录成功',
    accessTime: '2026-10-01 10:00:00',
  },
  {
    infoId: 2,
    userName: 'admin',
    ipaddr: '127.0.0.1',
    loginLocation: '内网IP',
    browser: 'Chrome',
    os: 'Windows 10',
    status: '1',
    msg: '密码错误',
    accessTime: '2026-10-01 10:05:00',
  },
];

const getLogininforListMock = vi.mocked(fetchGetLogininforList);
const unlockMock = vi.mocked(fetchUnlockLogininfor);

beforeEach(() => {
  setupTestAuth();

  getLogininforListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: logininfors.length, rows: logininfors },
    error: null,
  });

  unlockMock.mockResolvedValue({ data: null, error: null });

  // Auto-confirm the feedback dialog so the unlock interaction can be tested.
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
    components: { SystemLogininfor },
    template: '<VApp><SystemLogininfor /></VApp>',
  });
}

describe('login log page', () => {
  it('renders the login log rows', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('登录日志');
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('127.0.0.1');
    expect(wrapper.text()).toContain('登录成功');
    expect(wrapper.text()).toContain('密码错误');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('unlocks a failed login user from the row action', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    const unlockButtons = wrapper.findAll('button[aria-label="解锁"]');

    expect(unlockButtons).toHaveLength(1);

    await unlockButtons[0]?.trigger('click');

    await vi.waitFor(() => {
      expect(unlockMock).toHaveBeenCalledWith('admin');
    });

    wrapper.unmount();
  });
});
