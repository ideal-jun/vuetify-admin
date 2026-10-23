import { afterEach, describe, expect, it } from 'vitest';

import { localStg } from '@/utils/storage';

import { handleMockRequest } from './index';

describe('mock service', () => {
  afterEach(() => {
    localStg.remove('token');
  });

  it('rejects an invalid login', async () => {
    const response = await handleMockRequest({
      url: '/auth/login',
      method: 'POST',
      data: { userName: 'admin', password: 'wrong' },
    });

    expect(response.error?.code).toBe('1001');
  });

  it('logs in and returns the user info', async () => {
    const login = await handleMockRequest<Api.Auth.LoginToken>({
      url: '/auth/login',
      method: 'POST',
      data: { userName: 'admin', password: '123456' },
    });

    expect(login.error).toBeNull();

    if (!login.data) {
      throw new Error('login failed');
    }

    localStg.set('token', login.data.token);

    const userInfo = await handleMockRequest<Api.Auth.UserInfo>({
      url: '/auth/getUserInfo',
    });

    expect(userInfo.data?.userName).toBe('Admin');
    expect(userInfo.data?.roles).toContain('R_SUPER');
  });

  it('sends a captcha and logs in with a phone code', async () => {
    const phone = '13800000001';

    const sent = await handleMockRequest<Api.Auth.CaptchaResult>({
      url: '/auth/sendCaptcha',
      method: 'POST',
      data: { phone },
    });

    expect(sent.data?.sent).toBe(true);

    const invalid = await handleMockRequest<Api.Auth.LoginToken>({
      url: '/auth/codeLogin',
      method: 'POST',
      data: { phone, code: '000000' },
    });

    expect(invalid.error?.code).toBe('1003');

    const login = await handleMockRequest<Api.Auth.LoginToken>({
      url: '/auth/codeLogin',
      method: 'POST',
      data: { phone, code: '123456' },
    });

    expect(login.error).toBeNull();
    expect(login.data?.token).toBe('mock-token:1');
  });

  it('requests a password reset for a known account', async () => {
    const response = await handleMockRequest<Api.Auth.ResetPasswordResult>({
      url: '/auth/resetPassword',
      method: 'POST',
      data: { account: 'admin' },
    });

    expect(response.data?.sent).toBe(true);

    const missing = await handleMockRequest<Api.Auth.ResetPasswordResult>({
      url: '/auth/resetPassword',
      method: 'POST',
      data: { account: 'missing' },
    });

    expect(missing.error?.code).toBe('1004');
  });

  it('returns the home overview', async () => {
    const response = await handleMockRequest<Api.Home.Overview>({
      url: '/home/overview',
    });

    expect(response.error).toBeNull();
    expect(response.data?.stats).toHaveLength(4);
    expect(response.data?.sources.direct).toBeGreaterThan(0);
    expect(response.data?.trend.thisWeek).toHaveLength(7);
  });

  it('returns the constant routes', async () => {
    const response = await handleMockRequest<Api.Route.MenuRoute[]>({
      url: '/route/getConstantRoutes',
    });

    expect(response.data?.some((route) => route.name === 'home')).toBe(true);
  });

  it('returns a filtered and paginated user list', async () => {
    const response = await handleMockRequest<Api.SystemManage.UserList>({
      url: '/systemManage/getUserList',
      params: { current: 1, size: 5, userName: 'a' },
    });

    expect(response.error).toBeNull();
    expect(response.data?.records).toHaveLength(5);
    expect(response.data?.total).toBeGreaterThan(5);
    expect(response.data?.records.every((user) => user.userName.toLowerCase().includes('a'))).toBe(
      true,
    );
  });

  it('sorts the user list on the server', async () => {
    const asc = await handleMockRequest<Api.SystemManage.UserList>({
      url: '/systemManage/getUserList',
      params: { current: 1, size: 100, sortBy: 'userName', sortOrder: 'asc' },
    });
    const desc = await handleMockRequest<Api.SystemManage.UserList>({
      url: '/systemManage/getUserList',
      params: { current: 1, size: 100, sortBy: 'userName', sortOrder: 'desc' },
    });

    const ascNames = asc.data?.records.map((user) => user.userName) ?? [];
    const descNames = desc.data?.records.map((user) => user.userName) ?? [];

    expect(ascNames).toEqual(ascNames.toSorted((first, second) => first.localeCompare(second)));
    expect(descNames).toEqual(descNames.toSorted((first, second) => second.localeCompare(first)));
  });

  it('creates and deletes a user', async () => {
    const createResponse = await handleMockRequest<boolean>({
      url: '/systemManage/createUser',
      method: 'POST',
      data: {
        userName: 'MockTester',
        userGender: '1',
        nickName: 'Mock Tester',
        userPhone: '13800009999',
        userEmail: 'mock-tester@example.com',
        userRoles: ['R_USER'],
        status: '1',
      },
    });

    expect(createResponse.data).toBe(true);

    const listResponse = await handleMockRequest<Api.SystemManage.UserList>({
      url: '/systemManage/getUserList',
      params: { current: 1, size: 10, userName: 'MockTester' },
    });

    const createdUser = listResponse.data?.records[0];

    expect(createdUser?.userName).toBe('MockTester');

    if (!createdUser) {
      throw new Error('the user was not created');
    }

    const deleteResponse = await handleMockRequest<boolean>({
      url: '/systemManage/deleteUser',
      method: 'DELETE',
      data: { id: createdUser.id },
    });

    expect(deleteResponse.data).toBe(true);
  });

  it('returns a filtered and paginated role list', async () => {
    const response = await handleMockRequest<Api.SystemManage.RoleList>({
      url: '/systemManage/getRoleList',
      params: { current: 1, size: 10 },
    });

    expect(response.error).toBeNull();
    expect(response.data?.total).toBe(4);
    expect(response.data?.records[0]?.roleName).toBe('Super Admin');
    expect(response.data?.records[0]?.userCount).toBeGreaterThan(0);
  });

  it('sorts roles on the server', async () => {
    const response = await handleMockRequest<Api.SystemManage.RoleList>({
      url: '/systemManage/getRoleList',
      params: { current: 1, size: 100, sortBy: 'roleName', sortOrder: 'asc' },
    });

    const names = response.data?.records.map((role) => role.roleName) ?? [];

    expect(names).toEqual(names.toSorted((first, second) => first.localeCompare(second)));
  });

  it('creates and deletes a role', async () => {
    const createResponse = await handleMockRequest<boolean>({
      url: '/systemManage/createRole',
      method: 'POST',
      data: {
        roleName: 'Auditor',
        roleCode: 'R_AUDITOR',
        roleDesc: 'Review business data.',
        status: '1',
      },
    });

    expect(createResponse.data).toBe(true);

    const listResponse = await handleMockRequest<Api.SystemManage.RoleList>({
      url: '/systemManage/getRoleList',
      params: { current: 1, size: 10, roleCode: 'R_AUDITOR' },
    });

    const createdRole = listResponse.data?.records[0];

    expect(createdRole?.roleName).toBe('Auditor');

    if (!createdRole) {
      throw new Error('the role was not created');
    }

    const deleteResponse = await handleMockRequest<boolean>({
      url: '/systemManage/deleteRole',
      method: 'DELETE',
      data: { id: createdRole.id },
    });

    expect(deleteResponse.data).toBe(true);
  });
});
