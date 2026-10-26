import { request } from '../request';

/** Normalize a date input to a full day range value understood by the backend */
function toBeginTime(value: string | null) {
  return value ? `${value} 00:00:00` : undefined;
}

function toEndTime(value: string | null) {
  return value ? `${value} 23:59:59` : undefined;
}

/** Map the search model to the backend query params, the date range uses indexed params */
function toQueryParams(params: Api.SystemOperlog.SearchParams) {
  const { beginTime, endTime, ...rest } = params;

  return {
    ...rest,
    'params[beginTime]': toBeginTime(beginTime),
    'params[endTime]': toEndTime(endTime),
  };
}

/**
 * Get the operation log list
 *
 * @param params The backend query params
 */
export function fetchGetOperlogList(params: Api.SystemOperlog.SearchParams) {
  return request<Api.SystemOperlog.OperlogList>({
    url: '/system/operlog/list',
    params: toQueryParams(params),
  });
}

/**
 * Delete operation logs
 *
 * @param ids The operation log ids
 */
export function fetchDeleteOperlogs(ids: number[]) {
  return request<null>({ url: `/system/operlog/${ids.join(',')}`, method: 'DELETE' });
}

/** Clean all operation logs */
export function fetchCleanOperlogs() {
  return request<null>({ url: '/system/operlog/clean', method: 'DELETE' });
}
