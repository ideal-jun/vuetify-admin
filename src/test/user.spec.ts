import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCreateUser, fetchGetAllRoles, fetchGetUserList } from '@/service/api';
import { setupTestAuth } from '@/test/auth';
import roleOptionFixture from '@/test/fixtures/backend/role-option.json';
import userListFixture from '@/test/fixtures/backend/user-list.json';
import { waitForButton, waitForDrawer, waitForTableRows, waitForText } from '@/test/wait';
import SystemUser from '@/views/system/user/index.vue';

vi.mock('@/service/api', () => ({
  fetchBatchDeleteUser: vi.fn(),
  fetchCreateUser: vi.fn(),
  fetchDeleteUser: vi.fn(),
  fetchGetAllRoles: vi.fn(),
  fetchGetUserList: vi.fn(),
  fetchUpdateUser: vi.fn(),
}));

const fixtureUsers = userListFixture.rows as unknown as Api.SystemManage.User[];
const allRoles = roleOptionFixture.data as unknown as Api.SystemManage.AllRole[];

const getUserListMock = vi.mocked(fetchGetUserList);
const getAllRolesMock = vi.mocked(fetchGetAllRoles);
const createUserMock = vi.mocked(fetchCreateUser);

let users: Api.SystemManage.User[] = [];

beforeEach(() => {
  setupTestAuth();

  users = fixtureUsers.map((user) => structuredClone(user));

  getUserListMock.mockImplementation(async () => ({
    data: {
      code: 200,
      msg: '查询成功',
      total: users.length,
      rows: structuredClone(users),
    },
    error: null,
  }));

  getAllRolesMock.mockResolvedValue({ data: structuredClone(allRoles), error: null });

  createUserMock.mockImplementation(async (payload) => {
    users = [
      ...users,
      {
        userId: 9000 + users.length,
        userName: payload.userName,
        nickName: payload.nickName,
        sex: payload.sex ?? '2',
        phonenumber: payload.phonenumber ?? '',
        email: payload.email ?? '',
        status: payload.status ?? '0',
        dept: null,
        roles: [],
      },
    ];

    return { data: null, error: null };
  });
});

function mountPage() {
  return mount({
    components: { SystemUser },
    template: '<VApp><SystemUser /></VApp>',
  });
}

describe('user management page', () => {
  it('renders the backend user table with sex, status and department fields', async () => {
    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.text()).toContain('用户列表');
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('若依');
    expect(wrapper.text()).toContain('研发部门');
    expect(wrapper.text()).toContain('15888888888');
    expect(wrapper.text()).toContain('女');
    expect(wrapper.text()).toContain('正常');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    wrapper.unmount();
  });

  it('hides delete actions when the user lacks the delete permission', async () => {
    setupTestAuth({
      permissions: ['system:user:list', 'system:user:add', 'system:user:edit'],
      roles: ['common'],
    });

    const wrapper = mountPage();

    await waitForText(wrapper, '第 1-2 条，共 2 条');

    expect(wrapper.findAll('button[aria-label="删除"]')).toHaveLength(0);
    expect(wrapper.findAll('button').some((button) => button.text().trim() === '新增')).toBe(true);

    wrapper.unmount();
  });

  it('creates a user from the operate drawer', async () => {
    const wrapper = mountPage();

    await waitForTableRows(wrapper, 2);

    const addButton = await waitForButton(wrapper, '新增');

    await addButton.trigger('click');

    const drawer = await waitForDrawer(wrapper, '新增用户');

    await drawer.find('input[placeholder="请输入用户名"]').setValue('TestUser');

    const confirmButton = drawer
      .findAll('button')
      .find((button) => button.text().trim() === '确认');

    expect(confirmButton).toBeDefined();

    await confirmButton?.trigger('click');

    await waitForText(wrapper, '第 1-3 条，共 3 条');

    expect(wrapper.text()).toContain('TestUser');
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'TestUser', password: 'admin123', status: '0' }),
    );

    wrapper.unmount();
  });
});
