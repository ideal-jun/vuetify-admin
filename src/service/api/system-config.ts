import { request } from '../request';

/**
 * Get the configuration list
 *
 * @param params The search params and the pagination params
 */
export function fetchGetConfigList(params: Api.SystemManage.ConfigSearchParams) {
  return request<Api.SystemManage.ConfigList>({
    url: '/system/config/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get the configuration detail
 *
 * @param configId The configuration id
 */
export function fetchGetConfig(configId: number) {
  return request<Api.SystemManage.Config>({ url: `/system/config/${configId}` });
}

/**
 * Create a configuration
 *
 * @param data The configuration data
 */
export function fetchCreateConfig(data: Api.SystemManage.CreateConfig) {
  return request<null>({ url: '/system/config', method: 'POST', data });
}

/**
 * Update a configuration
 *
 * @param data The configuration data, including the configuration id
 */
export function fetchUpdateConfig(data: Api.SystemManage.UpdateConfig) {
  return request<null>({ url: '/system/config', method: 'PUT', data });
}

/**
 * Delete a configuration
 *
 * @param configId The configuration id
 */
export function fetchDeleteConfig(configId: number) {
  return request<null>({ url: `/system/config/${configId}`, method: 'DELETE' });
}

/**
 * Batch delete configurations
 *
 * @param configIds The configuration ids
 */
export function fetchBatchDeleteConfig(configIds: number[]) {
  return request<null>({ url: `/system/config/${configIds.join(',')}`, method: 'DELETE' });
}

/** Refresh the configuration cache on the backend */
export function fetchRefreshConfigCache() {
  return request<null>({ url: '/system/config/refreshCache', method: 'DELETE' });
}
