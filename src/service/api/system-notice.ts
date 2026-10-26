import { request } from '../request';

/**
 * Get the notice list
 *
 * @param params The search params and the pagination params
 */
export function fetchGetNoticeList(params: Api.SystemManage.NoticeSearchParams) {
  return request<Api.SystemManage.NoticeList>({
    url: '/system/notice/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get the notice detail
 *
 * @param noticeId The notice id
 */
export function fetchGetNotice(noticeId: number) {
  return request<Api.SystemManage.Notice>({ url: `/system/notice/${noticeId}` });
}

/**
 * Create a notice
 *
 * @param data The notice data
 */
export function fetchCreateNotice(data: Api.SystemManage.CreateNotice) {
  return request<null>({ url: '/system/notice', method: 'POST', data });
}

/**
 * Update a notice
 *
 * @param data The notice data, including the notice id
 */
export function fetchUpdateNotice(data: Api.SystemManage.UpdateNotice) {
  return request<null>({ url: '/system/notice', method: 'PUT', data });
}

/**
 * Delete a notice
 *
 * @param noticeId The notice id
 */
export function fetchDeleteNotice(noticeId: number) {
  return request<null>({ url: `/system/notice/${noticeId}`, method: 'DELETE' });
}

/**
 * Batch delete notices
 *
 * @param noticeIds The notice ids
 */
export function fetchBatchDeleteNotice(noticeIds: number[]) {
  return request<null>({ url: `/system/notice/${noticeIds.join(',')}`, method: 'DELETE' });
}
