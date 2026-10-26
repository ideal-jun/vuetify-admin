import { request } from '../request';

/**
 * Get the department list
 *
 * @param params The search params
 */
export function fetchGetDeptList(params?: Api.SystemManage.DeptSearchParams) {
  return request<Api.SystemManage.DeptList>({
    url: '/system/dept/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get the department detail
 *
 * @param deptId The department id
 */
export function fetchGetDept(deptId: number) {
  return request<Api.Backend.Dept>({ url: `/system/dept/${deptId}` });
}

/**
 * Get the department list without the given department and its descendants
 *
 * It is used by the parent select of the operate drawer.
 *
 * @param deptId The department id to exclude
 */
export function fetchGetDeptExcludeChild(deptId: number) {
  return request<Api.SystemManage.DeptList>({ url: `/system/dept/list/exclude/${deptId}` });
}

/**
 * Create a department
 *
 * @param data The department data
 */
export function fetchCreateDept(data: Api.SystemManage.CreateDept) {
  return request<null>({ url: '/system/dept', method: 'POST', data });
}

/**
 * Update a department
 *
 * @param data The department data, including the department id
 */
export function fetchUpdateDept(data: Api.SystemManage.UpdateDept) {
  return request<null>({ url: '/system/dept', method: 'PUT', data });
}

/**
 * Delete a department
 *
 * @param deptId The department id
 */
export function fetchDeleteDept(deptId: number) {
  return request<null>({ url: `/system/dept/${deptId}`, method: 'DELETE' });
}
