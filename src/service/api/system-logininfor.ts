import { request } from '../request';

/** Normalize a date input to a full day range value understood by the backend */
function toBeginTime(value: string | null) {
  return value ? `${value} 00:00:00` : undefined;
}

function toEndTime(value: string | null) {
  return value ? `${value} 23:59:59` : undefined;
}

/** Map the search model to the backend query params, the date range uses indexed params */
function toQueryParams(params: Api.SystemLogininfor.SearchParams) {
  const { beginTime, endTime, ...rest } = params;

  return {
    ...rest,
    'params[beginTime]': toBeginTime(beginTime),
    'params[endTime]': toEndTime(endTime),
  };
}

/**
 * Get the login log list
 *
 * @param params The backend query params
 */
export function fetchGetLogininforList(params: Api.SystemLogininfor.SearchParams) {
  return request<Api.SystemLogininfor.LogininforList>({
    url: '/system/logininfor/list',
    params: toQueryParams(params),
  });
}

/**
 * Delete login logs
 *
 * @param ids The login log ids
 */
export function fetchDeleteLogininfors(ids: number[]) {
  return request<null>({ url: `/system/logininfor/${ids.join(',')}`, method: 'DELETE' });
}

/** Clean all login logs */
export function fetchCleanLogininfors() {
  return request<null>({ url: '/system/logininfor/clean', method: 'DELETE' });
}

/**
 * Unlock a locked user
 *
 * @param userName The user name
 */
export function fetchUnlockLogininfor(userName: string) {
  return request<null>({
    url: `/system/logininfor/unlock/${encodeURIComponent(userName)}`,
    method: 'GET',
  });
}
