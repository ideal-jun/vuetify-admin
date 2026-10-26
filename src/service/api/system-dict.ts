import { request } from '../request';

/**
 * Get the dictionary type list
 *
 * @param params The backend query params
 */
export function fetchGetDictTypeList(params: Api.SystemDict.DictTypeSearchParams) {
  return request<Api.SystemDict.DictTypeList>({
    url: '/system/dict/type/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get a dictionary type
 *
 * @param dictId The dictionary type id
 */
export function fetchGetDictTypeDetail(dictId: number) {
  return request<Api.SystemDict.DictType>({ url: `/system/dict/type/${dictId}` });
}

/**
 * Create a dictionary type
 *
 * @param data The dictionary type payload
 */
export function fetchCreateDictType(data: Api.SystemDict.CreateDictType) {
  return request<null>({ url: '/system/dict/type', method: 'POST', data });
}

/**
 * Update a dictionary type
 *
 * @param data The dictionary type payload, including the dictionary type id
 */
export function fetchUpdateDictType(data: Api.SystemDict.UpdateDictType) {
  return request<null>({ url: '/system/dict/type', method: 'PUT', data });
}

/**
 * Delete dictionary types
 *
 * @param ids The dictionary type ids
 */
export function fetchDeleteDictTypes(ids: number[]) {
  return request<null>({ url: `/system/dict/type/${ids.join(',')}`, method: 'DELETE' });
}

/** Refresh the dictionary cache */
export function fetchRefreshDictTypeCache() {
  return request<null>({ url: '/system/dict/type/refreshCache', method: 'DELETE' });
}

/** Get the dictionary type options */
export function fetchGetDictTypeOptions() {
  return request<Api.SystemDict.DictTypeOption[]>({ url: '/system/dict/type/optionselect' });
}

/**
 * Get the dictionary data list
 *
 * @param params The backend query params
 */
export function fetchGetDictDataList(params: Api.SystemDict.DictDataSearchParams) {
  return request<Api.SystemDict.DictDataList>({
    url: '/system/dict/data/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get a dictionary data row
 *
 * @param dictCode The dictionary data id
 */
export function fetchGetDictDataDetail(dictCode: number) {
  return request<Api.SystemDict.DictData>({ url: `/system/dict/data/${dictCode}` });
}

/**
 * Create a dictionary data row
 *
 * @param data The dictionary data payload
 */
export function fetchCreateDictData(data: Api.SystemDict.CreateDictData) {
  return request<null>({ url: '/system/dict/data', method: 'POST', data });
}

/**
 * Update a dictionary data row
 *
 * @param data The dictionary data payload, including the dictionary data id
 */
export function fetchUpdateDictData(data: Api.SystemDict.UpdateDictData) {
  return request<null>({ url: '/system/dict/data', method: 'PUT', data });
}

/**
 * Delete dictionary data rows
 *
 * @param ids The dictionary data ids
 */
export function fetchDeleteDictData(ids: number[]) {
  return request<null>({ url: `/system/dict/data/${ids.join(',')}`, method: 'DELETE' });
}

/**
 * Get the dictionary data of a dictionary type
 *
 * @param dictType The dictionary type
 */
export function fetchGetDictDataByType(dictType: string) {
  return request<Api.SystemDict.DictData[]>({
    url: `/system/dict/data/type/${encodeURIComponent(dictType)}`,
  });
}
