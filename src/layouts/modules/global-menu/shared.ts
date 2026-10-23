/** Get the first navigable route path of a menu tree */
export function getFirstLeafPath(menu: App.Global.Menu): string {
  if (!menu.children?.length) {
    return menu.routePath;
  }

  for (const child of menu.children) {
    const path = getFirstLeafPath(child);

    if (path) {
      return path;
    }
  }

  return menu.routePath;
}

/** Whether the menu matches the current route */
export function isMenuActive(menu: App.Global.Menu, routeName: string, activeMenu?: string | null) {
  return routeName === menu.key || routeName.startsWith(`${menu.key}_`) || activeMenu === menu.key;
}
