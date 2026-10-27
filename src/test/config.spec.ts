import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGetConfigList } from '@/service/api/system-config';
import { setupTestAuth } from '@/test/auth';
import { waitForButton, waitForDrawer, waitForText } from '@/test/wait';
import SystemConfig from '@/views/system/config/index.vue';

vi.mock('@/service/api/system-config', () => ({
  fetchBatchDeleteConfig: vi.fn(),
  fetchCreateConfig: vi.fn(),
  fetchDeleteConfig: vi.fn(),
  fetchGetConfig: vi.fn(),
  fetchGetConfigList: vi.fn(),
  fetchRefreshConfigCache: vi.fn(),
  fetchUpdateConfig: vi.fn(),
}));

const configs: Api.SystemManage.Config[] = [
  {
    configId: 1,
    configName: '账号自助-验证码开关',
    configKey: 'sys.account.captchaEnabled',
    configValue: 'true',
    configType: 'Y',
    remark: '是否开启验证码功能',
    createTime: '2026-10-01 10:00:00',
  },
  {
    configId: 2,
    configName: '用户管理-账号初始密码',
    configKey: 'sys.user.initPassword',
    configValue: '123456',
    configType: 'N',
    remark: '初始化密码',
    createTime: '2026-10-02 11:00:00',
  },
];

const getConfigListMock = vi.mocked(fetchGetConfigList);

beforeEach(() => {
  setupTestAuth();

  getConfigListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: configs.length, rows: configs },
    error: null,
  });
});

function mountPage() {
  return mount({
    components: { SystemConfig },
    template: '<VApp><SystemConfig /></VApp>',
  });
}

describe('parameter configuration page', () => {
  it('renders the configuration rows', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('参数列表');
    expect(wrapper.text()).toContain('sys.account.captchaEnabled');
    expect(wrapper.text()).toContain('sys.user.initPassword');
    expect(wrapper.text()).toContain('系统内置');
    expect(wrapper.text()).toContain('自定义');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('opens the add drawer', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    const addButton = await waitForButton(wrapper, '新增');

    await addButton.trigger('click');

    const drawer = await waitForDrawer(wrapper, '新增参数');

    expect(drawer.find('input[placeholder="请输入参数名称"]').exists()).toBe(true);
    expect(drawer.find('input[placeholder="请输入参数键名"]').exists()).toBe(true);

    wrapper.unmount();
  });
});
