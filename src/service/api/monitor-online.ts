import { request } from '../request';

/**
 * Get the online user list
 *
 * @param params The backend query params
 */
export function fetchGetOnlineList(params: Api.MonitorOnline.SearchParams) {
  return request<Api.MonitorOnline.OnlineList>({
    url: '/system/online/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Force a signed-in user to log out
 *
 * @param tokenId The session token id
 */
export function fetchForceLogout(tokenId: string) {
  return request<null>({ url: `/system/online/${tokenId}`, method: 'DELETE' });
}
