import { describe, expect, it } from 'vitest';

import getRoutersFixture from '@/test/fixtures/ruoyi/get-routers.json';

import type { ElegantConstRoute } from './route-key';
import { transformRuoYiRouters } from './ruoyi';

const routers = getRoutersFixture.data as unknown as Api.RuoYi.RouterRecord[];

function flattenRoutes(routes: ElegantConstRoute[]): ElegantConstRoute[] {
  return routes.flatMap((route) => [
    route,
    ...(route.children ? flattenRoutes(route.children) : []),
  ]);
}

function collectExternalHrefs(records: Api.RuoYi.RouterRecord[]): string[] {
  return records.flatMap((record) => {
    const isExternal = Boolean(record.meta?.link) || record.path.startsWith('http');
    const hrefs = isExternal ? [record.meta?.link || record.path] : [];

    return [...hrefs, ...(record.children ? collectExternalHrefs(record.children) : [])];
  });
}

const routes = transformRuoYiRouters(routers);
const flatRoutes = flattenRoutes(routes);

function findRoute(name: string) {
  return flatRoutes.find((route) => route.name === name);
}

function childOf(routesToSearch: ElegantConstRoute[], name: string) {
  return routesToSearch.find((route) => route.name === name);
}

describe('transformRuoYiRouters', () => {
  it('wraps the top-level Layout entries in a base layout route', () => {
    expect(routes).toHaveLength(4);

    const system = findRoute('system');

    expect(system).toMatchObject({
      name: 'system',
      path: '/system',
      component: 'layout.base',
      meta: {
        title: '系统管理',
        icon: 'mdi-cog-outline',
        keepAlive: true,
        hideInMenu: false,
        order: 1,
      },
    });
    expect(system?.children?.map((child) => child.name)).toEqual([
      'system_user',
      'system_role',
      'system_menu',
      'ruoyi_dept',
      'ruoyi_post',
      'ruoyi_dict',
      'ruoyi_config',
      'ruoyi_notice',
      'log',
    ]);

    expect(findRoute('monitor')).toMatchObject({ path: '/monitor', component: 'layout.base' });
    expect(findRoute('tool')).toMatchObject({ path: '/tool', component: 'layout.base' });
  });

  it('maps the supported RuoYi views to the canonical route names and components', () => {
    const system = findRoute('system');

    expect(childOf(system?.children ?? [], 'system_user')).toMatchObject({
      name: 'system_user',
      path: 'user',
      component: 'view.system_user',
      meta: { title: '用户管理', icon: 'mdi-account-outline', order: 1 },
    });
    expect(childOf(system?.children ?? [], 'system_role')).toMatchObject({
      name: 'system_role',
      path: 'role',
      component: 'view.system_role',
      meta: { title: '角色管理', icon: 'mdi-account-group-outline', order: 2 },
    });
    expect(childOf(system?.children ?? [], 'system_menu')).toMatchObject({
      name: 'system_menu',
      path: 'menu',
      component: 'view.system_menu',
      meta: { title: '菜单管理', icon: 'mdi-table', order: 3 },
    });
  });

  it('registers the unsupported RuoYi views with the placeholder component', () => {
    const dept = findRoute('ruoyi_dept');

    expect(dept).toMatchObject({
      name: 'ruoyi_dept',
      path: 'dept',
      component: 'view.unsupported',
      meta: { title: '部门管理', icon: 'mdi-file-tree', order: 4 },
    });
    expect(findRoute('ruoyi_post')?.component).toBe('view.unsupported');
    expect(findRoute('ruoyi_online')?.component).toBe('view.unsupported');
  });

  it('keeps ParentView directories nested', () => {
    const system = findRoute('system');
    const log = childOf(system?.children ?? [], 'log');

    expect(log).toMatchObject({
      name: 'log',
      path: 'log',
      meta: { title: '日志管理', icon: 'mdi-file-document-outline', order: 9 },
    });
    expect(log?.children?.map((child) => child.name)).toEqual([
      'ruoyi_operlog',
      'ruoyi_logininfor',
    ]);
    expect(log?.children?.[0]).toMatchObject({
      path: 'operlog',
      component: 'view.unsupported',
      meta: { title: '操作日志', icon: 'mdi-form-select', order: 1 },
    });
    expect(log?.children?.[1]).toMatchObject({
      path: 'logininfor',
      component: 'view.unsupported',
      meta: { title: '登录日志', icon: 'mdi-login', order: 2 },
    });
  });

  it('turns external links into /external routes with meta.href and unique names', () => {
    const sentinelRecord = routers
      .flatMap((record) => record.children ?? [])
      .find((record) => record.name.includes('8718'));
    const sentinel = findRoute('external_http_localhost_8718');

    expect(sentinelRecord).toBeDefined();
    expect(sentinel).toMatchObject({
      path: '/external/http_localhost_8718',
      component: 'view.unsupported',
      meta: {
        title: 'Sentinel控制台',
        icon: 'mdi-shield-alert-outline',
      },
    });
    expect(sentinel?.meta?.href).toBe(sentinelRecord?.meta?.link);

    const externalRoutes = flatRoutes.filter((route) => route.meta?.href);

    expect(externalRoutes).toHaveLength(5);
    expect(externalRoutes.every((route) => route.path.startsWith('/external/'))).toBe(true);
    expect(externalRoutes.map((route) => route.meta?.href)).toEqual(collectExternalHrefs(routers));

    const names = flatRoutes.map((route) => route.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('maps hidden, noCache and order to the route meta', () => {
    const customRouters: Api.RuoYi.RouterRecord[] = [
      {
        name: 'Hidden',
        path: '/hidden',
        hidden: true,
        component: 'system/hidden/index',
        meta: { title: '隐藏页面', icon: 'user', noCache: true },
      },
    ];

    const [hiddenRoute] = transformRuoYiRouters(customRouters);

    expect(hiddenRoute).toMatchObject({
      name: 'ruoyi_hidden',
      path: '/hidden',
      meta: {
        title: '隐藏页面',
        keepAlive: false,
        hideInMenu: true,
        order: 1,
      },
    });
  });

  it('maps RuoYi icon names to MDI and falls back for unknown icons', () => {
    expect(findRoute('system_user')?.meta?.icon).toBe('mdi-account-outline');
    expect(findRoute('system_role')?.meta?.icon).toBe('mdi-account-group-outline');
    expect(findRoute('ruoyi_dept')?.meta?.icon).toBe('mdi-file-tree');

    const [unknownIconRoute, passthroughIconRoute, missingIconRoute] = transformRuoYiRouters([
      {
        name: 'Unknown',
        path: '/unknown',
        component: 'system/user/index',
        meta: { title: '未知图标', icon: 'not-a-ruoyi-icon' },
      },
      {
        name: 'Passthrough',
        path: '/passthrough',
        component: 'system/user/index',
        meta: { title: 'MDI 图标', icon: 'mdi-home' },
      },
      {
        name: 'Missing',
        path: '/missing',
        component: 'system/user/index',
        meta: { title: '缺少图标' },
      },
    ]);

    expect(unknownIconRoute?.meta?.icon).toBe('mdi-circle-small');
    expect(passthroughIconRoute?.meta?.icon).toBe('mdi-home');
    expect(missingIconRoute?.meta?.icon).toBe('mdi-circle-small');
  });
});
