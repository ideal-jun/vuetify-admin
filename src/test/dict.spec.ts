import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGetDictDataList, fetchGetDictTypeList } from '@/service/api/system-dict';
import { setupTestAuth } from '@/test/auth';
import { waitForTableRows, waitForText } from '@/test/wait';
import SystemDict from '@/views/system/dict/index.vue';

vi.mock('@/service/api/system-dict', () => ({
  fetchCreateDictData: vi.fn(),
  fetchCreateDictType: vi.fn(),
  fetchDeleteDictData: vi.fn(),
  fetchDeleteDictTypes: vi.fn(),
  fetchGetDictDataByType: vi.fn(),
  fetchGetDictDataDetail: vi.fn(),
  fetchGetDictDataList: vi.fn(),
  fetchGetDictTypeDetail: vi.fn(),
  fetchGetDictTypeList: vi.fn(),
  fetchGetDictTypeOptions: vi.fn(),
  fetchRefreshDictTypeCache: vi.fn(),
  fetchUpdateDictData: vi.fn(),
  fetchUpdateDictType: vi.fn(),
}));

const dictTypes: Api.SystemDict.DictType[] = [
  { dictId: 1, dictName: '用户性别', dictType: 'sys_user_sex', status: '0' },
  { dictId: 2, dictName: '系统开关', dictType: 'sys_normal_disable', status: '0' },
];

const dictData: Api.SystemDict.DictData[] = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '男',
    dictValue: '0',
    dictType: 'sys_user_sex',
    status: '0',
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '女',
    dictValue: '1',
    dictType: 'sys_user_sex',
    status: '0',
  },
];

const getTypeListMock = vi.mocked(fetchGetDictTypeList);
const getDataListMock = vi.mocked(fetchGetDictDataList);

beforeEach(() => {
  setupTestAuth();

  getTypeListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: dictTypes.length, rows: dictTypes },
    error: null,
  });

  getDataListMock.mockResolvedValue({
    data: { code: 200, msg: '查询成功', total: dictData.length, rows: dictData },
    error: null,
  });
});

function mountPage() {
  return mount({
    components: { SystemDict },
    template: '<VApp><SystemDict /></VApp>',
  });
}

describe('dictionary management page', () => {
  it('renders the dictionary type rows', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '用户性别');

    expect(wrapper.text()).toContain('字典类型');
    expect(wrapper.text()).toContain('字典数据');
    expect(wrapper.text()).toContain('系统开关');
    expect(wrapper.text()).toContain('sys_user_sex');
    expect(wrapper.text()).toContain('sys_normal_disable');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('loads the dictionary data rows when a type is selected', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 2);
    expect(getDataListMock).not.toHaveBeenCalled();

    const typeRow = wrapper.findAll('tbody tr').find((row) => row.text().includes('sys_user_sex'));

    expect(typeRow).toBeDefined();

    await typeRow?.trigger('click');

    await waitForText(wrapper, '男');

    expect(getDataListMock).toHaveBeenCalledWith(
      expect.objectContaining({ dictType: 'sys_user_sex', pageNum: 1 }),
    );
    expect(wrapper.text()).toContain('女');
    expect(wrapper.findAll('tbody tr')).toHaveLength(4);

    wrapper.unmount();
  });
});
