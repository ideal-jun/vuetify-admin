import { mount } from '@vue/test-utils';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGetGenTableList, fetchPreviewGenTable } from '@/service/api/tool-gen';
import { setupTestAuth } from '@/test/auth';
import { waitForText } from '@/test/wait';
import ToolGen from '@/views/tool/gen/index.vue';

vi.mock('@/service/api/tool-gen', () => ({
  fetchDeleteGenTable: vi.fn(),
  fetchGenCode: vi.fn(),
  fetchGetDbTableList: vi.fn(),
  fetchGetGenTable: vi.fn(),
  fetchGetGenTableList: vi.fn(),
  fetchImportGenTables: vi.fn(),
  fetchPreviewGenTable: vi.fn(),
  fetchSynchGenDb: vi.fn(),
  fetchUpdateGenTable: vi.fn(),
}));

const genTables: Api.ToolGen.GenTable[] = [
  {
    tableId: 1,
    tableName: 'sys_user',
    tableComment: '用户信息',
    className: 'SysUser',
    packageName: 'com.ruoyi.system',
    moduleName: 'system',
    businessName: 'user',
    functionName: '用户管理',
    functionAuthor: 'ruoyi',
    tplCategory: 'crud',
    tplWebType: 'element-plus',
    createTime: '2026-10-01 10:00:00',
    updateTime: '2026-10-02 11:00:00',
  },
  {
    tableId: 2,
    tableName: 'sys_role',
    tableComment: '角色信息',
    className: 'SysRole',
    packageName: 'com.ruoyi.system',
    moduleName: 'system',
    businessName: 'role',
    functionName: '角色管理',
    functionAuthor: 'ruoyi',
    tplCategory: 'crud',
    tplWebType: 'element-plus',
  },
];

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

const getGenTableListMock = vi.mocked(fetchGetGenTableList);
const previewGenTableMock = vi.mocked(fetchPreviewGenTable);

beforeEach(() => {
  setupTestAuth();

  getGenTableListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: genTables.length, rows: genTables },
    error: null,
  });

  previewGenTableMock.mockResolvedValue({
    data: { 'vm/java/domain.java.vm': 'public class SysUser {}' },
    error: null,
  });
});

function mountPage() {
  return mount({
    components: { ToolGen },
    template: '<VApp><ToolGen /></VApp>',
  });
}

describe('code generation page', () => {
  it('renders the generation config rows', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, 'sys_user');

    expect(wrapper.text()).toContain('代码生成');
    expect(wrapper.text()).toContain('用户信息');
    expect(wrapper.text()).toContain('SysUser');
    expect(wrapper.text()).toContain('sys_role');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('opens the preview dialog for a table', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, 'sys_user');

    const previewButton = wrapper.find('button[aria-label="预览代码"]');

    expect(previewButton.exists()).toBe(true);

    await previewButton.trigger('click');

    await vi.waitFor(() => {
      expect(previewGenTableMock).toHaveBeenCalledWith(1);
    });

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('代码预览');
    });

    wrapper.unmount();
  });
});
