import { request } from '../request';

/**
 * Get the generation config list
 *
 * @param params The backend query params
 */
export function fetchGetGenTableList(params: Api.ToolGen.GenTableSearchParams) {
  return request<Api.ToolGen.GenTableList>({
    url: '/code/gen/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get the database tables that can still be imported
 *
 * @param params The backend query params
 */
export function fetchGetDbTableList(params: Api.ToolGen.DbTableSearchParams) {
  return request<Api.ToolGen.DbTableList>({
    url: '/code/gen/db/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get a generation config together with its columns
 *
 * @param tableId The generation config id
 */
export function fetchGetGenTable(tableId: number) {
  return request<Api.ToolGen.Detail>({ url: `/code/gen/${tableId}` });
}

/**
 * Update a generation config
 *
 * @param data The generation config, including the column rows
 */
export function fetchUpdateGenTable(data: Api.ToolGen.UpdatePayload) {
  return request<null>({ url: '/code/gen', method: 'PUT', data });
}

/**
 * Import database tables into the code generator
 *
 * The backend requires the front-end template as well, so both values are sent as query params.
 *
 * @param params The comma separated table names and the front-end template
 */
export function fetchImportGenTables(params: Api.ToolGen.ImportParams) {
  return request<null>({
    url: '/code/gen/importTable',
    method: 'POST',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Preview the rendered code of a generation config
 *
 * @param tableId The generation config id
 */
export function fetchPreviewGenTable(tableId: number) {
  return request<Api.ToolGen.PreviewMap>({ url: `/code/gen/preview/${tableId}` });
}

/**
 * Delete generation configs
 *
 * @param tableIds The generation config ids
 */
export function fetchDeleteGenTable(tableIds: number[]) {
  return request<null>({ url: `/code/gen/${tableIds.join(',')}`, method: 'DELETE' });
}

/**
 * Synchronize the column definitions of a generation config with the database
 *
 * @param tableName The database table name
 */
export function fetchSynchGenDb(tableName: string) {
  return request<null>({ url: `/code/gen/synchDb/${encodeURIComponent(tableName)}` });
}

/**
 * Generate the code of a table to the custom path configured on the generation config
 *
 * @param tableName The database table name
 */
export function fetchGenCode(tableName: string) {
  return request<null>({ url: `/code/gen/genCode/${encodeURIComponent(tableName)}` });
}
