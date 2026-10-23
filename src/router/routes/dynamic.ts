import { layouts, views } from '../elegant/imports';
import type { AppRoute, LastLevelRouteKey, RouteConfig, RouteLayout } from '../route-key';

/**
 * Resolve the route declarations fetched from the backend
 *
 * It is only used in the dynamic auth route mode. The backend declares a component by a string, like
 * `layout.base$view.home`, so the declaration must be resolved to a real route.
 *
 * @param routes Route declarations
 */
export function resolveRoutes(routes: RouteConfig[]): AppRoute[] {
  return routes.flatMap((route) => resolveRoute(route));
}

/**
 * Resolve a route declaration
 *
 * @param route Route declaration
 */
function resolveRoute(route: RouteConfig): AppRoute[] {
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

  function isFirstLevelRoute(item: RouteConfig) {
    return !item.name.includes(ROUTE_DEGREE_SPLITTER);
  }

  function isSingleLevelRoute(item: RouteConfig) {
    return isFirstLevelRoute(item) && !item.children?.length;
  }

  function getSingleLevelRouteComponent(component: string) {
    const [layout = '', view = ''] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);

    return {
      layout: getLayoutName(layout),
      view: getViewName(view),
    };
  }

  const appRoutes: AppRoute[] = [];

  // add props: true to route
  if (route.path.includes(':') && !route.props) {
    route.props = true;
  }

  const { name, path, component, children, ...rest } = route;

  const appRoute: AppRoute = { name, path, ...rest };

  try {
    if (component) {
      if (isSingleLevelRoute(route)) {
        const { layout, view } = getSingleLevelRouteComponent(component);

        const singleLevelRoute: AppRoute = {
          path,
          component: layouts[layout],
          children: [
            {
              name,
              path: '',
              component: views[view],
              ...rest,
            },
          ],
        };

        return [singleLevelRoute];
      }

      if (isLayout(component)) {
        appRoute.component = layouts[getLayoutName(component)];
      }

      if (isView(component)) {
        appRoute.component = views[getViewName(component)];
      }
    }
  } catch (error) {
    console.error(`Error resolving route "${route.name}": ${String(error)}`);

    return [];
  }

  // add redirect to child
  if (children?.length && !appRoute.redirect) {
    appRoute.redirect = {
      name: children[0]?.name,
    };
  }

  if (children?.length) {
    const childRoutes = children.flatMap((child) => resolveRoute(child));

    if (isFirstLevelRoute(route)) {
      appRoute.children = childRoutes;
    } else {
      appRoutes.push(...childRoutes);
    }
  }

  appRoutes.unshift(appRoute);

  return appRoutes;
}
