import { request } from '../request';

/** Get the data rendered by the home page */
export function fetchGetHomeOverview() {
  return request<Api.Home.Overview>({ url: '/home/overview' });
}
