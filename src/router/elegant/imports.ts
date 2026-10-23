import type { RouteComponent } from 'vue-router';

import BaseLayout from '@/layouts/base-layout/index.vue';
import BlankLayout from '@/layouts/blank-layout/index.vue';

import type { LastLevelRouteKey, RouteComponentInput, RouteLayout } from '../route-key';

export const layouts: Record<RouteLayout, RouteComponentInput> = {
  base: BaseLayout,
  blank: BlankLayout,
};

export const views: Record<LastLevelRouteKey, RouteComponentInput> = {
  '403': () => import('@/views/_builtin/403/index.vue'),
  '404': () => import('@/views/_builtin/404/index.vue'),
  '500': () => import('@/views/_builtin/500/index.vue'),
  'iframe-page': () => import('@/views/_builtin/iframe-page/IframePage.vue'),
  login: () => import('@/views/_builtin/login/index.vue'),
  home: () => import('@/views/home/index.vue'),
  system_menu: () => import('@/views/system/menu/index.vue'),
  system_user: () => import('@/views/system/user/index.vue'),
  system_role: () => import('@/views/system/role/index.vue'),
};

/** The type of the lazy loaded view map */
export type ViewComponentMap = typeof views;

/** The type of the layout map */
export type LayoutComponentMap = typeof layouts;

/** The type of a view component */
export type ViewComponent = RouteComponent | (() => Promise<RouteComponent>);
