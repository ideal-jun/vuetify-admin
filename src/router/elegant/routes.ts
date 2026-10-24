import type { ElegantConstRoute } from '../route-key';

/**
 * The generated elegant routes
 *
 * This file is the equivalent of elegant-router's generated `routes.ts`. Add a route here (or generate it with a
 * file convention in your own project) and it will be picked up by `createStaticRoutes`.
 */
export const generatedRoutes: ElegantConstRoute[] = [
  {
    name: '403',
    path: '/403',
    component: 'layout.blank$view.403',
    meta: {
      title: '403',
      i18nKey: 'route.403',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    name: '404',
    path: '/404',
    component: 'layout.blank$view.404',
    meta: {
      title: '404',
      i18nKey: 'route.404',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    name: '500',
    path: '/500',
    component: 'layout.blank$view.500',
    meta: {
      title: '500',
      i18nKey: 'route.500',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    name: 'home',
    path: '/home',
    component: 'layout.base$view.home',
    meta: {
      title: 'home',
      i18nKey: 'route.home',
      icon: 'mdi-view-dashboard-outline',
      order: 1,
      constant: true,
      keepAlive: true,
    },
  },
  {
    name: 'iframe-page',
    path: '/iframe-page/:url',
    component: 'layout.base$view.iframe-page',
    props: true,
    meta: {
      title: 'iframe-page',
      i18nKey: 'route.iframe-page',
      constant: true,
      hideInMenu: true,
      keepAlive: true,
    },
  },
  {
    name: 'login',
    path: '/login',
    component: 'layout.blank$view.login',
    meta: {
      title: 'login',
      i18nKey: 'route.login',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    name: 'system',
    path: '/system',
    component: 'layout.base',
    meta: {
      title: 'system',
      i18nKey: 'route.system',
      icon: 'mdi-cog-outline',
      order: 2,
    },
    children: [
      {
        name: 'system_menu',
        path: '/system/menu',
        component: 'view.system_menu',
        meta: {
          title: 'system_menu',
          i18nKey: 'route.system_menu',
          icon: 'mdi-menu',
          order: 1,
          keepAlive: true,
          roles: ['admin'],
        },
      },
      {
        name: 'system_user',
        path: '/system/user',
        component: 'view.system_user',
        meta: {
          title: 'system_user',
          i18nKey: 'route.system_user',
          icon: 'mdi-account-multiple-outline',
          order: 2,
          keepAlive: true,
          roles: ['admin'],
        },
      },
      {
        name: 'system_role',
        path: '/system/role',
        component: 'view.system_role',
        meta: {
          title: 'system_role',
          i18nKey: 'route.system_role',
          icon: 'mdi-shield-account-outline',
          order: 3,
          keepAlive: true,
          roles: ['admin'],
        },
      },
    ],
  },
];
