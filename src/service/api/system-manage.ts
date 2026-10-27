import { request } from '../request';
import { downloadFile } from '../request/download';

/**
 * Get the user list
 *
 * @param params The backend query params
 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/system/user/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get the role list
 *
 * @param params The backend query params
 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/system/role/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/** Get all enabled roles */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({ url: '/system/role/optionselect' });
}

/**
 * Create a user
 *
 * @param data The backend user payload
 */
export function fetchCreateUser(data: Api.SystemManage.CreateUser) {
  return request<null>({ url: '/system/user', method: 'POST', data });
}

/**
 * Update a user
 *
 * @param data The backend user payload, including the user id
 */
export function fetchUpdateUser(data: Api.SystemManage.UpdateUser) {
  return request<null>({ url: '/system/user', method: 'PUT', data });
}

/**
 * Delete a user
 *
 * @param userId The user id
 */
/** Change the enabled/disabled status of a user */
export function fetchChangeUserStatus(data: { userId: number; status: Api.Backend.Status }) {
  return request<null>({ url: '/system/user/changeStatus', method: 'PUT', data });
}

/** Export the current user query to an Excel file */
export function exportUserList(params?: Record<string, unknown>) {
  return downloadFile({
    url: '/system/user/export',
    method: 'POST',
    params,
    filename: 'users.xlsx',
  });
}

/** Reset a user's password */
export function fetchResetUserPwd(data: { userId: number; password: string }) {
  return request<null>({ url: '/system/user/resetPwd', method: 'PUT', data });
}

export function fetchDeleteUser(userId: number) {
  return request<null>({ url: `/system/user/${userId}`, method: 'DELETE' });
}

/**
 * Batch delete users
 *
 * @param ids The user ids
 */
export function fetchBatchDeleteUser(ids: number[]) {
  return request<null>({ url: `/system/user/${ids.join(',')}`, method: 'DELETE' });
}

/**
 * Create a role
 *
 * @param data The backend role payload
 */
export function fetchCreateRole(data: Api.SystemManage.CreateRole) {
  return request<null>({ url: '/system/role', method: 'POST', data });
}

/**
 * Update a role
 *
 * @param data The backend role payload, including the role id
 */
export function fetchUpdateRole(data: Api.SystemManage.UpdateRole) {
  return request<null>({ url: '/system/role', method: 'PUT', data });
}

/**
 * Delete a role
 *
 * @param roleId The role id
 */
export function fetchDeleteRole(roleId: number) {
  return request<null>({ url: `/system/role/${roleId}`, method: 'DELETE' });
}

/**
 * Batch delete roles
 *
 * @param ids The role ids
 */
export function fetchBatchDeleteRole(ids: number[]) {
  return request<null>({ url: `/system/role/${ids.join(',')}`, method: 'DELETE' });
}

/** Get the flat menu list from GET /system/menu/list */
export function fetchGetMenuList() {
  return request<Api.Backend.Menu[]>({ url: '/system/menu/list' });
}

/**
 * Create a menu
 *
 * @param data The backend menu payload
 */
export function fetchCreateMenu(data: Api.Menu.Create) {
  return request<null>({ url: '/system/menu', method: 'POST', data });
}

/**
 * Update a menu
 *
 * @param data The backend menu payload, including the menu id
 */
export function fetchUpdateMenu(data: Api.Menu.Update) {
  return request<null>({ url: '/system/menu', method: 'PUT', data });
}

/**
 * Delete a menu
 *
 * @param menuId The menu id
 */
export function fetchDeleteMenu(menuId: number) {
  return request<null>({ url: `/system/menu/${menuId}`, method: 'DELETE' });
}

/**
 * Batch delete menus
 *
 * backend only accepts one menu id per request, so the batch is sent one by one.
 *
 * @param ids The menu ids
 */
export async function fetchBatchDeleteMenu(ids: number[]) {
  for (const id of ids) {
    const result = await fetchDeleteMenu(id);

    if (result.error) {
      return result;
    }
  }

  return { data: null, error: null };
}
