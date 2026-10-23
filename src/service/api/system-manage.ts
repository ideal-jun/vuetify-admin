import { request } from '../request';

/**
 * Get the user list
 *
 * @param params The search params and the pagination params
 */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    params,
  });
}

/**
 * Get the role list
 *
 * @param params The search params and the pagination params
 */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    params,
  });
}

/** Get all enabled roles */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({ url: '/systemManage/getAllRoles' });
}

/**
 * Create a user
 *
 * @param data The user data
 */
export function fetchCreateUser(data: Api.SystemManage.CreateUser) {
  return request<boolean>({
    url: '/systemManage/createUser',
    method: 'POST',
    data,
  });
}

/**
 * Update a user
 *
 * @param data The user data, including the user id
 */
export function fetchUpdateUser(data: Api.SystemManage.UpdateUser) {
  return request<boolean>({
    url: '/systemManage/updateUser',
    method: 'PUT',
    data,
  });
}

/**
 * Delete a user
 *
 * @param id The user id
 */
export function fetchDeleteUser(id: number) {
  return request<boolean>({
    url: '/systemManage/deleteUser',
    method: 'DELETE',
    data: { id },
  });
}

/**
 * Batch delete users
 *
 * @param ids The user ids
 */
export function fetchBatchDeleteUser(ids: number[]) {
  return request<boolean>({
    url: '/systemManage/batchDeleteUser',
    method: 'DELETE',
    data: { ids },
  });
}

/**
 * Create a role
 *
 * @param data The role data
 */
export function fetchCreateRole(data: Api.SystemManage.CreateRole) {
  return request<boolean>({
    url: '/systemManage/createRole',
    method: 'POST',
    data,
  });
}

/**
 * Update a role
 *
 * @param data The role data, including the role id
 */
export function fetchUpdateRole(data: Api.SystemManage.UpdateRole) {
  return request<boolean>({
    url: '/systemManage/updateRole',
    method: 'PUT',
    data,
  });
}

/**
 * Delete a role
 *
 * @param id The role id
 */
export function fetchDeleteRole(id: number) {
  return request<boolean>({
    url: '/systemManage/deleteRole',
    method: 'DELETE',
    data: { id },
  });
}

/**
 * Batch delete roles
 *
 * @param ids The role ids
 */
export function fetchBatchDeleteRole(ids: number[]) {
  return request<boolean>({
    url: '/systemManage/batchDeleteRole',
    method: 'DELETE',
    data: { ids },
  });
}
