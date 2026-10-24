import { request } from '../request';

/** Get the router tree of the signed-in user from GET /system/menu/getRouters */
export function fetchGetRouters() {
  return request<Api.RuoYi.RouterRecord[]>({ url: '/system/menu/getRouters' });
}
