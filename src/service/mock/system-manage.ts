type MockRole = Omit<Api.SystemManage.Role, 'userCount'>;

const mockRoles: MockRole[] = [
  {
    id: 1,
    createBy: 'Admin',
    createTime: '2025-01-01 08:00:00',
    updateBy: 'Admin',
    updateTime: '2025-01-01 08:00:00',
    status: '1',
    roleName: 'Super Admin',
    roleCode: 'R_SUPER',
    roleDesc: 'Full access to all system features.',
  },
  {
    id: 2,
    createBy: 'Admin',
    createTime: '2025-02-01 09:00:00',
    updateBy: 'Admin',
    updateTime: '2025-02-01 09:00:00',
    status: '1',
    roleName: 'Admin',
    roleCode: 'R_ADMIN',
    roleDesc: 'Manage business data and system configuration.',
  },
  {
    id: 3,
    createBy: 'Admin',
    createTime: '2025-03-01 10:00:00',
    updateBy: 'Admin',
    updateTime: '2025-03-01 10:00:00',
    status: '1',
    roleName: 'User',
    roleCode: 'R_USER',
    roleDesc: 'Standard business user with basic permissions.',
  },
  {
    id: 4,
    createBy: 'Admin',
    createTime: '2025-04-01 11:00:00',
    updateBy: 'Admin',
    updateTime: '2025-04-01 11:00:00',
    status: '1',
    roleName: 'Guest',
    roleCode: 'R_GUEST',
    roleDesc: 'Read-only visitor with limited permissions.',
  },
];

const USER_NAMES = [
  'Admin',
  'Soybean',
  'User',
  'Guest',
  'Alice',
  'Bob',
  'Charlie',
  'David',
  'Eva',
  'Frank',
  'Grace',
  'Henry',
  'Ivy',
  'Jack',
  'Kate',
  'Leo',
  'Mia',
  'Nathan',
  'Olivia',
  'Peter',
  'Queen',
  'Ryan',
  'Sophia',
  'Tom',
  'Uma',
  'Victor',
  'Wendy',
  'Xavier',
];

const SURNAMES = ['Chen', 'Liu', 'Wang', 'Zhao', 'Sun', 'Zhou', 'Wu', 'Zheng'];

const GENDERS: Api.SystemManage.UserGender[] = ['1', '2'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function createDateTime(index: number) {
  const month = (index % 12) + 1;
  const day = (index % 27) + 1;
  const hour = 8 + (index % 10);
  const minute = (index * 7) % 60;

  return `2026-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:00`;
}

function createPhone(index: number) {
  return `138${String(10_000_000 + index * 137).padStart(8, '0')}`;
}

function createRoles(index: number, userName: string) {
  if (userName === 'Admin') {
    return ['R_SUPER', 'R_ADMIN'];
  }

  if (userName === 'Soybean') {
    return ['R_ADMIN'];
  }

  if (userName === 'Guest') {
    return ['R_GUEST'];
  }

  if (index % 5 === 0) {
    return ['R_ADMIN', 'R_USER'];
  }

  return ['R_USER'];
}

function createUser(index: number, userName: string): Api.SystemManage.User {
  const surname = SURNAMES[index % SURNAMES.length] ?? 'Chen';
  const gender = GENDERS[index % GENDERS.length] ?? '1';
  const createTime = createDateTime(index);
  const isSimpleName = ['Admin', 'Soybean', 'User', 'Guest'].includes(userName);

  return {
    id: index + 1,
    createBy: 'Admin',
    createTime,
    updateBy: 'Admin',
    updateTime: createTime,
    status: index % 8 === 3 || index % 11 === 7 ? '2' : '1',
    userName,
    userGender: index % 6 === 5 ? null : gender,
    nickName: isSimpleName ? userName : `${userName} ${surname}`,
    userPhone: createPhone(index),
    userEmail: `${userName.toLowerCase()}@example.com`,
    userRoles: createRoles(index, userName),
  };
}

const mockUsers: Api.SystemManage.User[] = USER_NAMES.map((userName, index) =>
  createUser(index, userName),
);

function getRoleUserCount(roleCode: string) {
  return mockUsers.filter((user) => user.userRoles.includes(roleCode)).length;
}

function getAllRoles(): Api.SystemManage.AllRole[] {
  return mockRoles
    .filter((role) => role.status === '1')
    .map((role) => ({
      id: role.id,
      roleName: role.roleName,
      roleCode: role.roleCode,
    }));
}

function nextRoleId() {
  return mockRoles.reduce((max, role) => Math.max(max, role.id), 0) + 1;
}

function hasRoleCode(roleCode: string, excludeId?: number) {
  const normalized = roleCode.trim().toLowerCase();

  return mockRoles.some(
    (role) => role.id !== excludeId && role.roleCode.trim().toLowerCase() === normalized,
  );
}

function isRoleFormValid(data: Partial<Api.SystemManage.RoleForm> | null | undefined) {
  return Boolean(data?.roleName?.trim() && data?.roleCode?.trim());
}

function getRoleSortValue(role: Api.SystemManage.Role, sortBy: string) {
  switch (sortBy) {
    case 'roleName': {
      return role.roleName;
    }
    case 'roleCode': {
      return role.roleCode;
    }
    case 'status': {
      return role.status ?? '';
    }
    case 'createTime': {
      return role.createTime;
    }
    case 'userCount': {
      return role.userCount;
    }
    default: {
      return role.id;
    }
  }
}

function compareRoles(
  first: Api.SystemManage.Role,
  second: Api.SystemManage.Role,
  params: Record<string, unknown>,
) {
  const sortBy = String(params.sortBy ?? '');

  if (!sortBy) {
    return first.id - second.id;
  }

  const firstValue = getRoleSortValue(first, sortBy);
  const secondValue = getRoleSortValue(second, sortBy);
  const direction = params.sortOrder === 'desc' ? -1 : 1;

  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return (firstValue - secondValue) * direction;
  }

  return (
    String(firstValue).localeCompare(String(secondValue), undefined, { numeric: true }) * direction
  );
}

function getRoleList(params: Record<string, unknown>) {
  const current = Math.max(1, Number(params.current) || 1);
  const size = Math.min(100, Math.max(1, Number(params.size) || 10));

  const records = mockRoles
    .map((role) => ({
      ...role,
      userCount: getRoleUserCount(role.roleCode),
    }))
    .filter((role) => {
      return (
        includesText(role.roleName, params.roleName) &&
        includesText(role.roleCode, params.roleCode) &&
        equalsValue(role.status, params.status)
      );
    })
    .toSorted((first, second) => compareRoles(first, second, params));

  const start = (current - 1) * size;

  return {
    records: records.slice(start, start + size),
    current,
    size,
    total: records.length,
  };
}

function createSuccess<T>(data: T): App.Service.FlatResponseData<T> {
  return { data, error: null };
}

function createFailure(code: string, message: string): App.Service.FlatResponseData<never> {
  return {
    data: null,
    error: { code, message },
  };
}

function includesText(value: string, keyword: unknown) {
  const normalized = String(keyword ?? '')
    .trim()
    .toLowerCase();

  return !normalized || value.toLowerCase().includes(normalized);
}

function equalsValue(value: string | null, expected: unknown) {
  const normalized = String(expected ?? '').trim();

  return !normalized || value === normalized;
}

function formatNow() {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
}

function nextUserId() {
  return mockUsers.reduce((max, user) => Math.max(max, user.id), 0) + 1;
}

function hasUserName(userName: string, excludeId?: number) {
  const normalized = userName.trim().toLowerCase();

  return mockUsers.some(
    (user) => user.id !== excludeId && user.userName.trim().toLowerCase() === normalized,
  );
}

function isFormValid(data: Partial<Api.SystemManage.UserForm> | null | undefined) {
  return Boolean(data?.userName?.trim());
}

function getSortValue(user: Api.SystemManage.User, sortBy: string) {
  switch (sortBy) {
    case 'userName': {
      return user.userName;
    }
    case 'userGender': {
      return user.userGender ?? '';
    }
    case 'status': {
      return user.status ?? '';
    }
    case 'createTime': {
      return user.createTime;
    }
    default: {
      return String(user.id);
    }
  }
}

function compareUsers(
  first: Api.SystemManage.User,
  second: Api.SystemManage.User,
  params: Record<string, unknown>,
) {
  const sortBy = String(params.sortBy ?? '');

  if (!sortBy) {
    return second.id - first.id;
  }

  const result = getSortValue(first, sortBy).localeCompare(
    getSortValue(second, sortBy),
    undefined,
    {
      numeric: true,
    },
  );

  return params.sortOrder === 'desc' ? -result : result;
}

function getUserList(params: Record<string, unknown>) {
  const current = Math.max(1, Number(params.current) || 1);
  const size = Math.min(100, Math.max(1, Number(params.size) || 10));

  const records = mockUsers
    .filter((user) => {
      return (
        includesText(user.userName, params.userName) &&
        includesText(user.nickName, params.nickName) &&
        includesText(user.userPhone, params.userPhone) &&
        includesText(user.userEmail, params.userEmail) &&
        equalsValue(user.userGender, params.userGender) &&
        equalsValue(user.status, params.status)
      );
    })
    .toSorted((first, second) => compareUsers(first, second, params));

  const start = (current - 1) * size;

  return {
    records: records.slice(start, start + size),
    current,
    size,
    total: records.length,
  };
}

function handleCreateUser(config: App.Service.RequestConfig) {
  const data = config.data as Api.SystemManage.CreateUser | undefined;

  if (!isFormValid(data)) {
    return createFailure('1002', 'The user name is required');
  }

  const userName = String(data?.userName).trim();

  if (hasUserName(userName)) {
    return createFailure('1003', 'The user name already exists');
  }

  const now = formatNow();

  mockUsers.push({
    id: nextUserId(),
    createBy: 'Admin',
    createTime: now,
    updateBy: 'Admin',
    updateTime: now,
    status: data?.status ?? '1',
    userName,
    userGender: data?.userGender ?? null,
    nickName: data?.nickName ?? '',
    userPhone: data?.userPhone ?? '',
    userEmail: data?.userEmail ?? '',
    userRoles: data?.userRoles ?? [],
  });

  return createSuccess(true);
}

function handleUpdateUser(config: App.Service.RequestConfig) {
  const data = config.data as Api.SystemManage.UpdateUser | undefined;

  if (!isFormValid(data)) {
    return createFailure('1002', 'The user name is required');
  }

  const target = mockUsers.find((user) => user.id === data?.id);

  if (!target) {
    return createFailure('1004', 'The user does not exist');
  }

  if (hasUserName(String(data?.userName), target.id)) {
    return createFailure('1003', 'The user name already exists');
  }

  target.userName = String(data?.userName).trim();
  target.userGender = data?.userGender ?? null;
  target.nickName = data?.nickName ?? '';
  target.userPhone = data?.userPhone ?? '';
  target.userEmail = data?.userEmail ?? '';
  target.userRoles = data?.userRoles ?? [];
  target.status = data?.status ?? target.status;
  target.updateBy = 'Admin';
  target.updateTime = formatNow();

  return createSuccess(true);
}

function handleDeleteUser(config: App.Service.RequestConfig) {
  const id = Number((config.data as { id?: number } | undefined)?.id);
  const index = mockUsers.findIndex((user) => user.id === id);

  if (index === -1) {
    return createFailure('1004', 'The user does not exist');
  }

  mockUsers.splice(index, 1);

  return createSuccess(true);
}

function handleBatchDeleteUser(config: App.Service.RequestConfig) {
  const ids = (config.data as { ids?: number[] } | undefined)?.ids ?? [];

  for (const id of ids) {
    const index = mockUsers.findIndex((user) => user.id === id);

    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
  }

  return createSuccess(true);
}

function handleCreateRole(config: App.Service.RequestConfig) {
  const data = config.data as Api.SystemManage.CreateRole | undefined;

  if (!isRoleFormValid(data)) {
    return createFailure('1102', 'The role name and role code are required');
  }

  const roleName = String(data?.roleName).trim();
  const roleCode = String(data?.roleCode).trim();

  if (hasRoleCode(roleCode)) {
    return createFailure('1103', 'The role code already exists');
  }

  const now = formatNow();

  mockRoles.push({
    id: nextRoleId(),
    createBy: 'Admin',
    createTime: now,
    updateBy: 'Admin',
    updateTime: now,
    status: data?.status ?? '1',
    roleName,
    roleCode,
    roleDesc: data?.roleDesc ?? '',
  });

  return createSuccess(true);
}

function handleUpdateRole(config: App.Service.RequestConfig) {
  const data = config.data as Api.SystemManage.UpdateRole | undefined;

  if (!isRoleFormValid(data)) {
    return createFailure('1102', 'The role name and role code are required');
  }

  const target = mockRoles.find((role) => role.id === data?.id);

  if (!target) {
    return createFailure('1104', 'The role does not exist');
  }

  const roleCode = String(data?.roleCode).trim();

  if (hasRoleCode(roleCode, target.id)) {
    return createFailure('1103', 'The role code already exists');
  }

  target.roleName = String(data?.roleName).trim();
  target.roleCode = roleCode;
  target.roleDesc = data?.roleDesc ?? '';
  target.status = data?.status ?? target.status;
  target.updateBy = 'Admin';
  target.updateTime = formatNow();

  return createSuccess(true);
}

function handleDeleteRole(config: App.Service.RequestConfig) {
  const id = Number((config.data as { id?: number } | undefined)?.id);
  const index = mockRoles.findIndex((role) => role.id === id);

  if (index === -1) {
    return createFailure('1104', 'The role does not exist');
  }

  mockRoles.splice(index, 1);

  return createSuccess(true);
}

function handleBatchDeleteRole(config: App.Service.RequestConfig) {
  const ids = (config.data as { ids?: number[] } | undefined)?.ids ?? [];

  for (const id of ids) {
    const index = mockRoles.findIndex((role) => role.id === id);

    if (index !== -1) {
      mockRoles.splice(index, 1);
    }
  }

  return createSuccess(true);
}

/**
 * Handle the system management mock endpoints
 *
 * It returns `null` when the request does not belong to this module.
 */
export function handleSystemManageMockRequest(
  config: App.Service.RequestConfig,
): App.Service.FlatResponseData<unknown> | null {
  const method = config.method || 'GET';
  const path = config.url;

  if (method === 'GET' && path === '/systemManage/getAllRoles') {
    return createSuccess(getAllRoles());
  }

  if (method === 'GET' && path === '/systemManage/getRoleList') {
    return createSuccess(getRoleList(config.params ?? {}));
  }

  if (method === 'GET' && path === '/systemManage/getUserList') {
    return createSuccess(getUserList(config.params ?? {}));
  }

  if (method === 'POST' && path === '/systemManage/createUser') {
    return handleCreateUser(config);
  }

  if (method === 'PUT' && path === '/systemManage/updateUser') {
    return handleUpdateUser(config);
  }

  if (method === 'DELETE' && path === '/systemManage/deleteUser') {
    return handleDeleteUser(config);
  }

  if (method === 'DELETE' && path === '/systemManage/batchDeleteUser') {
    return handleBatchDeleteUser(config);
  }

  if (method === 'POST' && path === '/systemManage/createRole') {
    return handleCreateRole(config);
  }

  if (method === 'PUT' && path === '/systemManage/updateRole') {
    return handleUpdateRole(config);
  }

  if (method === 'DELETE' && path === '/systemManage/deleteRole') {
    return handleDeleteRole(config);
  }

  if (method === 'DELETE' && path === '/systemManage/batchDeleteRole') {
    return handleBatchDeleteRole(config);
  }

  return null;
}
