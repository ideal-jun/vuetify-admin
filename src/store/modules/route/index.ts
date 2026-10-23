import { defineStore } from 'pinia';
import { computed, nextTick, ref, shallowRef } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { SetupStoreId } from '@/enum';
import { env } from '@/env';
import { useBoolean } from '@/hooks/common/boolean';
import { router, setupBuiltinRoutes } from '@/router';
import { getRouteName, getRoutePath } from '@/router/route-key';
import type { ElegantConstRoute, LastLevelRouteKey, RouteKey, RouteMap } from '@/router/route-key';
import { createStaticRoutes, getAuthVueRoutes } from '@/router/routes';
import { ROOT_ROUTE } from '@/router/routes/builtin';
import { fetchGetConstantRoutes, fetchGetUserRoutes, fetchIsRouteExist } from '@/service/api';

import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';
import {
  filterAuthRoutesByRoles,
  filterRoutesByDev,
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  isRouteExistByRouteName,
  sortRoutesByOrder,
  transformMenuToSearchMenus,
  updateLocaleOfGlobalMenus,
} from './shared';

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const authStore = useAuthStore();
  const { bool: isInitConstantRoute, setBool: setIsInitConstantRoute } = useBoolean();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();

  /**
   * Auth route mode
   *
   * Static mode generates the auth routes in the front-end, dynamic mode fetches them from the backend.
   */
  const authRouteMode = ref(env.authRouteMode);

  /** Home route key */
  const routeHome = ref<LastLevelRouteKey>(env.routeHome);

  /** Set the home route */
  function setRouteHome(routeKey: LastLevelRouteKey) {
    routeHome.value = routeKey;
  }

  /** Constant routes */
  const constantRoutes = shallowRef<ElegantConstRoute[]>([]);

  function addConstantRoutes(routes: ElegantConstRoute[]) {
    const constantRoutesMap = new Map<string, ElegantConstRoute>();

    for (const route of routes) {
      constantRoutesMap.set(route.name, route);
    }

    constantRoutes.value = Array.from(constantRoutesMap.values());
  }

  /** Auth routes */
  const authRoutes = shallowRef<ElegantConstRoute[]>([]);

  function addAuthRoutes(routes: ElegantConstRoute[]) {
    const authRoutesMap = new Map<string, ElegantConstRoute>();

    for (const route of routes) {
      authRoutesMap.set(route.name, route);
    }

    authRoutes.value = Array.from(authRoutesMap.values());
  }

  const removeRouteFns: (() => void)[] = [];

  /** Global menus */
  const menus = ref<App.Global.Menu[]>([]);
  const searchMenus = computed(() => transformMenuToSearchMenus(menus.value));

  /** Get the global menus */
  function getGlobalMenus(routes: ElegantConstRoute[]) {
    menus.value = getGlobalMenusByAuthRoutes(routes);
  }

  /** Update the global menus by locale */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  /** Cache routes */
  const cacheRoutes = ref<RouteKey[]>([]);

  /** Exclude cache routes, for resetting the route cache */
  const excludeCacheRoutes = ref<RouteKey[]>([]);

  /** Get the cache routes */
  function getCacheRoutes(routes: RouteRecordRaw[]) {
    cacheRoutes.value = getCacheRouteNames(routes);
  }

  /**
   * Reset the route cache
   *
   * @default router.currentRoute.value.name
   * @param routeKey
   */
  async function resetRouteCache(routeKey?: RouteKey) {
    const routeName = routeKey || (router.currentRoute.value.name as RouteKey);

    if (!routeName) {
      return;
    }

    excludeCacheRoutes.value.push(routeName);

    await nextTick();

    excludeCacheRoutes.value = [];
  }

  /** Global breadcrumbs */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  /** Reset the store */
  async function resetStore() {
    const routeStore = useRouteStore();

    routeStore.$reset();

    resetVueRoutes();

    // After resetting the store, the constant route needs to be re-initialized
    await initConstantRoute();
  }

  /** Reset the vue routes */
  function resetVueRoutes() {
    for (const fn of removeRouteFns) {
      fn();
    }
    removeRouteFns.length = 0;
  }

  /** Init the constant route */
  async function initConstantRoute() {
    if (isInitConstantRoute.value) {
      return;
    }

    setupBuiltinRoutes();

    const staticRoute = createStaticRoutes();

    if (authRouteMode.value === 'static') {
      addConstantRoutes(staticRoute.constantRoutes);
    } else {
      const { data, error } = await fetchGetConstantRoutes();

      if (error) {
        // If fetching the constant routes fails, use the static constant routes
        addConstantRoutes(staticRoute.constantRoutes);
      } else {
        addConstantRoutes(data);
      }
    }

    handleConstantAndAuthRoutes();

    setIsInitConstantRoute(true);

    useTabStore().initHomeTab();
  }

  /** Init the auth route */
  async function initAuthRoute() {
    // Check if the user info is initialized
    if (!authStore.userInfo.userId) {
      await authStore.initUserInfo();
    }

    if (authRouteMode.value === 'static') {
      initStaticAuthRoute();
    } else {
      await initDynamicAuthRoute();
    }

    useTabStore().initHomeTab();
  }

  /** Init the static auth route */
  function initStaticAuthRoute() {
    const { authRoutes: staticAuthRoutes } = createStaticRoutes();

    if (authStore.isStaticSuper) {
      addAuthRoutes(staticAuthRoutes);
    } else {
      const filteredAuthRoutes = filterAuthRoutesByRoles(
        staticAuthRoutes,
        authStore.userInfo.roles,
      );

      addAuthRoutes(filteredAuthRoutes);
    }

    handleConstantAndAuthRoutes();

    setIsInitAuthRoute(true);
  }

  /** Init the dynamic auth route */
  async function initDynamicAuthRoute() {
    const { data, error } = await fetchGetUserRoutes();

    if (error) {
      // If fetching the user routes fails, reset the store
      await authStore.resetStore();
    } else {
      const { routes, home } = data;

      addAuthRoutes(routes);

      handleConstantAndAuthRoutes();

      setRouteHome(home);

      handleUpdateRootRouteRedirect(home);

      setIsInitAuthRoute(true);
    }
  }

  /** Handle constant and auth routes */
  function handleConstantAndAuthRoutes() {
    const allRoutes = filterRoutesByDev([...constantRoutes.value, ...authRoutes.value]);

    const sortRoutes = sortRoutesByOrder(allRoutes);

    const vueRoutes = getAuthVueRoutes(sortRoutes);

    resetVueRoutes();

    addRoutesToVueRouter(vueRoutes);

    getGlobalMenus(sortRoutes);

    getCacheRoutes(vueRoutes);
  }

  /** Add routes to the vue router */
  function addRoutesToVueRouter(routes: RouteRecordRaw[]) {
    for (const route of routes) {
      const removeFn = router.addRoute(route);
      addRemoveRouteFn(removeFn);
    }
  }

  function addRemoveRouteFn(fn: () => void) {
    removeRouteFns.push(fn);
  }

  /** Update the root route redirect when the auth route mode is dynamic */
  function handleUpdateRootRouteRedirect(redirectKey: LastLevelRouteKey) {
    const redirect = getRoutePath(redirectKey);

    if (redirect) {
      const rootRoute: ElegantConstRoute = { ...ROOT_ROUTE, redirect };

      router.removeRoute(rootRoute.name);

      const [rootVueRoute] = getAuthVueRoutes([rootRoute]);

      if (rootVueRoute) {
        router.addRoute(rootVueRoute);
      }
    }
  }

  /** Get whether the auth route exists */
  async function getIsAuthRouteExist(routePath: RouteMap[RouteKey]) {
    const routeName = getRouteName(routePath);

    if (!routeName) {
      return false;
    }

    if (authRouteMode.value === 'static') {
      const { authRoutes: staticAuthRoutes } = createStaticRoutes();

      return isRouteExistByRouteName(routeName, staticAuthRoutes);
    }

    const { data } = await fetchIsRouteExist(routeName);

    return data;
  }

  /** Get the selected menu key path */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }

  async function onRouteSwitchWhenLoggedIn() {
    // Some global init logic when logged in and switching routes
  }

  async function onRouteSwitchWhenNotLoggedIn() {
    // Some global init logic if it does not need to be logged in
  }

  return {
    resetStore,
    routeHome,
    setRouteHome,
    menus,
    searchMenus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    excludeCacheRoutes,
    resetRouteCache,
    breadcrumbs,
    initConstantRoute,
    isInitConstantRoute,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getIsAuthRouteExist,
    getSelectedMenuKeyPath,
    onRouteSwitchWhenLoggedIn,
    onRouteSwitchWhenNotLoggedIn,
  };
});
