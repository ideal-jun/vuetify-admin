import type { RouteRecordRaw } from 'vue-router';

import type {
  ElegantConstRoute,
  LastLevelRouteKey,
  RouteComponentInput,
  RouteLayout,
} from '../route-key';

/**
 * Transform elegant const routes to vue routes
 *
 * @param routes Elegant const routes
 * @param layouts Layout components
 * @param views View components
 */
export function transformElegantRoutesToVueRoutes(
  routes: ElegantConstRoute[],
  layouts: Record<string, RouteComponentInput>,
  views: Record<string, RouteComponentInput>,
) {
  return routes.flatMap((route) => transformElegantRouteToVueRoute(route, layouts, views));
}

/**
 * Transform an elegant route to a vue route
 *
 * @param route Elegant const route
 * @param layouts Layout components
 * @param views View components
 */
function transformElegantRouteToVueRoute(
  route: ElegantConstRoute,
  layouts: Record<string, RouteComponentInput>,
  views: Record<string, RouteComponentInput>,
) {
  const LAYOUT_PREFIX = 'layout.';
  const VIEW_PREFIX = 'view.';
  const ROUTE_DEGREE_SPLITTER = '_';
  const FIRST_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

  function isLayout(component: string) {
    return component.startsWith(LAYOUT_PREFIX);
  }

  function getLayoutName(component: string) {
    const layout = component.replace(LAYOUT_PREFIX, '') as RouteLayout;

    if (!layouts[layout]) {
      throw new Error(`Layout component "${layout}" not found`);
    }

    return layout;
  }

  function isView(component: string) {
    return component.startsWith(VIEW_PREFIX);
  }

  function getViewName(component: string) {
    const view = component.replace(VIEW_PREFIX, '') as LastLevelRouteKey;

    if (!views[view]) {
      throw new Error(`View component "${view}" not found`);
    }

    return view;
  }

  function isFirstLevelRoute(item: ElegantConstRoute) {
    return !item.name.includes(ROUTE_DEGREE_SPLITTER);
  }

  function isSingleLevelRoute(item: ElegantConstRoute) {
    return isFirstLevelRoute(item) && !item.children?.length;
  }

  function getSingleLevelRouteComponent(component: string) {
    const [layout = '', view = ''] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);

    return {
      layout: getLayoutName(layout),
      view: getViewName(view),
    };
  }

  const vueRoutes: RouteRecordRaw[] = [];

  // add props: true to route
  if (route.path.includes(':') && !route.props) {
    route.props = true;
  }

  const { name, path, component, children, ...rest } = route;

  const vueRoute = { name, path, ...rest } as RouteRecordRaw;

  try {
    if (component) {
      if (isSingleLevelRoute(route)) {
        const { layout, view } = getSingleLevelRouteComponent(component);

        const singleLevelRoute: RouteRecordRaw = {
          path,
          component: layouts[layout],
          meta: {
            title: route.meta?.title || '',
          },
          children: [
            {
              name,
              path: '',
              component: views[view],
              ...rest,
            } as RouteRecordRaw,
          ],
        };

        return [singleLevelRoute];
      }

      if (isLayout(component)) {
        vueRoute.component = layouts[getLayoutName(component)];
      }

      if (isView(component)) {
        vueRoute.component = views[getViewName(component)];
      }
    }
  } catch (error) {
    console.error(`Error transforming route "${route.name}": ${String(error)}`);

    return [];
  }

  // add redirect to child
  if (children?.length && !vueRoute.redirect) {
    vueRoute.redirect = {
      name: children[0]?.name,
    };
  }

  if (children?.length) {
    // Keep nested directories nested (RuoYi routers may be three or more levels deep).
    vueRoute.children = children.flatMap((child) =>
      transformElegantRouteToVueRoute(child, layouts, views),
    );
  }

  vueRoutes.unshift(vueRoute);

  return vueRoutes;
}
