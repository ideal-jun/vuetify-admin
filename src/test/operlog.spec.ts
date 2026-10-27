import { mount } from '@vue/test-utils';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGetOperlogList } from '@/service/api/system-operlog';
import { setupTestAuth } from '@/test/auth';
import { waitForText } from '@/test/wait';
import SystemOperlog from '@/views/system/operlog/index.vue';

vi.mock('@/service/api/system-operlog', () => ({
  fetchCleanOperlogs: vi.fn(),
  fetchDeleteOperlogs: vi.fn(),
  fetchGetOperlogList: vi.fn(),
}));

const operlogs: Api.SystemOperlog.Operlog[] = [
  {
    operId: 1,
    title: '用户管理',
    businessType: 2,
    method: 'com.ruoyi.system.controller.SysUserController.edit()',
    requestMethod: 'PUT',
    operatorType: 1,
    operName: 'admin',
    deptName: '研发部门',
    operUrl: '/system/user',
    operIp: '127.0.0.1',
    operLocation: '内网IP',
    operParam: '{"userId":1}',
    jsonResult: '{"code":200,"msg":"操作成功"}',
    status: '0',
    operTime: '2026-10-01 10:00:00',
    costTime: 12,
  },
  {
    operId: 2,
    title: '角色管理',
    businessType: 3,
    requestMethod: 'DELETE',
    operName: 'admin',
    operIp: '127.0.0.1',
    status: '1',
    errorMsg: '删除失败',
    operTime: '2026-10-02 11:00:00',
    costTime: 8,
  },
];

const getOperlogListMock = vi.mocked(fetchGetOperlogList);

beforeAll(() => {
  // Vuetify overlays measure the visual viewport, which jsdom does not implement.
  vi.stubGlobal('visualViewport', {
    width: 1280,
    height: 800,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
});

beforeEach(() => {
  setupTestAuth();

  getOperlogListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: operlogs.length, rows: operlogs },
    error: null,
  });
});

function mountPage() {
  return mount({
    components: { SystemOperlog },
    template: '<VApp><SystemOperlog /></VApp>',
  });
}

describe('operation log page', () => {
  it('renders the operation log rows', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('操作日志');
    expect(wrapper.text()).toContain('用户管理');
    expect(wrapper.text()).toContain('角色管理');
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('127.0.0.1');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('opens the operation log detail dialog', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    const detailButton = wrapper.find('button[aria-label="详细"]');

    expect(detailButton.exists()).toBe(true);

    await detailButton.trigger('click');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('操作日志详细');
    });

    wrapper.unmount();
  });
});
