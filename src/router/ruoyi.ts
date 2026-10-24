import type { RouteMeta } from 'vue-router';

import { translateRuoYiIcon } from '@/utils/icon';

import type { ElegantConstRoute, LastLevelRouteKey, RouteKey } from './route-key';

type RuoYiRouter = Api.RuoYi.RouterRecord;

/** The RuoYi component paths that have a matching view in this template */
const COMPONENT_VIEWS: Record<string, { view: LastLevelRouteKey; name: RouteKey }> = {
  'system/menu/index': { view: 'system_menu', name: 'system_menu' },
  'system/role/index': { view: 'system_role', name: 'system_role' },
  'system/user/index': { view: 'system_user', name: 'system_user' },
};

function sanitizeName(value: string) {
  return (
    value
      .replace(/[^a-zA-Z0-9]+/gu, '_')
      .replace(/^_+|_+$/gu, '')
      .toLowerCase() || 'route'
  );
}

function createUniqueName(base: string, usedNames: Set<string>) {
  let name = base;
  let index = 2;

  while (usedNames.has(name)) {
    name = `${base}_${index}`;
    index += 1;
  }

  usedNames.add(name);

  return name;
}

function isExternal(record: RuoYiRouter) {
  return Boolean(record.meta?.link) || /^https?:\/\//iu.test(record.path);
}

function createMeta(record: RuoYiRouter, order: number): RouteMeta {
  const meta = record.meta ?? {};

  return {
    title: meta.title || record.name,
    icon: translateRuoYiIcon(meta.icon),
    keepAlive: !meta.noCache,
    hideInMenu: Boolean(record.hidden),
    order,
    ...(meta.link ? { href: meta.link } : {}),
  };
}

function transformRecord(
  record: RuoYiRouter,
  order: number,
  isTopLevel: boolean,
  usedNames: Set<string>,
  usedPaths: Set<string>,
): ElegantConstRoute {
  const children = record.children ?? [];

  if (isExternal(record)) {
    const link = record.meta?.link || record.path;
    const baseSlug = sanitizeName(record.name || link);
    const basePath = `/external/${baseSlug}`;
    let path = basePath;
    let index = 2;

    while (usedPaths.has(path)) {
      path = `${basePath}_${index}`;
      index += 1;
    }

    usedPaths.add(path);

    return {
      name: createUniqueName(`external_${baseSlug}`, usedNames) as RouteKey,
      path,
      component: 'view.unsupported',
      meta: createMeta(record, order),
    };
  }

  if (isTopLevel && children.length > 0) {
    const name = createUniqueName(sanitizeName(record.name), usedNames);

    return {
      name: name as RouteKey,
      path: record.path,
      component: 'layout.base',
      meta: createMeta(record, order),
      children: children.map((child, index) =>
        transformRecord(child, index + 1, false, usedNames, usedPaths),
      ),
    };
  }

  if (children.length > 0) {
    const name = createUniqueName(sanitizeName(record.name), usedNames);

    return {
      name: name as RouteKey,
      path: record.path,
      meta: createMeta(record, order),
      children: children.map((child, index) =>
        transformRecord(child, index + 1, false, usedNames, usedPaths),
      ),
    };
  }

  const view = COMPONENT_VIEWS[record.component ?? ''];

  if (view) {
    return {
      name: createUniqueName(view.name, usedNames) as RouteKey,
      path: record.path,
      component: `view.${view.view}`,
      meta: createMeta(record, order),
    };
  }

  return {
    name: createUniqueName(`ruoyi_${sanitizeName(record.name)}`, usedNames) as RouteKey,
    path: record.path,
    component: 'view.unsupported',
    meta: createMeta(record, order),
  };
}

/**
 * Transform the RuoYi `/system/menu/getRouters` tree into the elegant route declarations consumed by the route store.
 *
 * Supported RuoYi component paths are mapped to the template views; the other pages are registered with the
 * "unsupported" placeholder so the backend menu is still rendered exactly as returned. External links become routes
 * with `meta.href` (the navigation guard opens them in a new tab).
 */
export function transformRuoYiRouters(routers: RuoYiRouter[]): ElegantConstRoute[] {
  const usedNames = new Set<string>();
  const usedPaths = new Set<string>();

  return routers.map((record, index) =>
    transformRecord(record, index + 1, true, usedNames, usedPaths),
  );
}
