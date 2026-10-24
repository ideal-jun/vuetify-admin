import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCreateRole, fetchGetRoleList } from '@/service/api';
import { setupTestAuth } from '@/test/auth';
import roleListFixture from '@/test/fixtures/ruoyi/role-list.json';
import { waitForButton, waitForDrawer, waitForTableRows, waitForText } from '@/test/wait';
import SystemRole from '@/views/system/role/index.vue';

vi.mock('@/service/api', () => ({
  fetchBatchDeleteRole: vi.fn(),
  fetchCreateRole: vi.fn(),
  fetchDeleteRole: vi.fn(),
  fetchGetRoleList: vi.fn(),
  fetchUpdateRole: vi.fn(),
}));

const fixtureRoles = roleListFixture.rows as unknown as Api.SystemManage.Role[];

const getRoleListMock = vi.mocked(fetchGetRoleList);
const createRoleMock = vi.mocked(fetchCreateRole);

let roles: Api.SystemManage.Role[] = [];

beforeEach(() => {
  setupTestAuth();

  roles = fixtureRoles.map((role) => structuredClone(role));

  getRoleListMock.mockImplementation(async () => ({
    data: {
      code: 200,
      msg: '查询成功',
      total: roles.length,
      rows: structuredClone(roles),
    },
    error: null,
  }));

  createRoleMock.mockImplementation(async (payload) => {
    roles = [
      ...roles,
      {
        roleId: 9000 + roles.length,
        roleName: payload.roleName,
        roleKey: payload.roleKey,
        roleSort: payload.roleSort ?? roles.length + 1,
        status: payload.status ?? '0',
        remark: payload.remark ?? '',
      },
    ];

    return { data: null, error: null };
  });
});

function mountPage() {
  return mount({
    components: { SystemRole },
    template: '<VApp><SystemRole /></VApp>',
  });
}

describe('role management page', () => {
  it('renders the RuoYi role table with role keys and sort fields', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('角色列表');
    expect(wrapper.text()).toContain('超级管理员');
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('common');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('creates a role from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 2);

    const addButton = await waitForButton(wrapper, '新增');

    await addButton.trigger('click');

    const drawer = await waitForDrawer(wrapper, '新增角色');

    await drawer.find('input[placeholder="请输入角色名称"]').setValue('Auditor');
    await drawer.find('input[placeholder="如 common"]').setValue('auditor');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    expect(confirmButton).toBeDefined();

    await confirmButton?.trigger('click');

    await waitForText(wrapper, '第 1-3 条，共 3 条');

    expect(wrapper.text()).toContain('Auditor');
    expect(createRoleMock).toHaveBeenCalledWith(
      expect.objectContaining({ roleName: 'Auditor', roleKey: 'auditor', status: '0' }),
    );

    wrapper.unmount();
  });
});
