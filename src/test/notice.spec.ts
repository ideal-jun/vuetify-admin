import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGetNoticeList } from '@/service/api/system-notice';
import { setupTestAuth } from '@/test/auth';
import { waitForButton, waitForDrawer, waitForText } from '@/test/wait';
import SystemNotice from '@/views/system/notice/index.vue';

vi.mock('@/service/api/system-notice', () => ({
  fetchBatchDeleteNotice: vi.fn(),
  fetchCreateNotice: vi.fn(),
  fetchDeleteNotice: vi.fn(),
  fetchGetNotice: vi.fn(),
  fetchGetNoticeList: vi.fn(),
  fetchUpdateNotice: vi.fn(),
}));

const notices: Api.SystemManage.Notice[] = [
  {
    noticeId: 1,
    noticeTitle: '系统升级通知',
    noticeType: '1',
    noticeContent: '系统将于今晚升级。',
    status: '0',
    createBy: 'admin',
    createTime: '2026-10-01 10:00:00',
  },
  {
    noticeId: 2,
    noticeTitle: '国庆放假公告',
    noticeType: '2',
    noticeContent: '国庆假期安排。',
    status: '0',
    createBy: 'admin',
    createTime: '2026-10-02 11:00:00',
  },
];

const getNoticeListMock = vi.mocked(fetchGetNoticeList);

beforeEach(() => {
  setupTestAuth();

  getNoticeListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: notices.length, rows: notices },
    error: null,
  });
});

function mountPage() {
  return mount({
    components: { SystemNotice },
    template: '<VApp><SystemNotice /></VApp>',
  });
}

describe('notice management page', () => {
  it('renders the notice rows', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('公告列表');
    expect(wrapper.text()).toContain('系统升级通知');
    expect(wrapper.text()).toContain('国庆放假公告');
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('opens the add drawer', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    const addButton = await waitForButton(wrapper, '新增');

    await addButton.trigger('click');

    await waitForDrawer(wrapper, '新增公告');

    wrapper.unmount();
  });
});
