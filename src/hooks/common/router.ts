import { useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';

import { router as globalRouter } from '@/router';
import type { RouteKey } from '@/router/route-key';

/**
 * Router push
 *
 * Jump to the specified route, it can replace `router.push`
 *
 * @param inSetup Whether it is used in `<script setup>`
 */
export function useRouterPush(inSetup = true) {
  const router = inSetup ? useRouter() : globalRouter;
  const route = globalRouter.currentRoute;

  const routerPush = router.push;

  const routerBack = router.back;

  async function routerPushByKey(key: RouteKey, options?: App.Global.RouterPushOptions) {
    const { query, params } = options || {};

    const routeLocation: RouteLocationRaw = {
      name: key,
    };

    if (Object.keys(query || {}).length > 0) {
      routeLocation.query = query;
    }

    if (Object.keys(params || {}).length > 0) {
      routeLocation.params = params;
    }

    return routerPush(routeLocation);
  }

  function routerPushByKeyWithMetaQuery(key: RouteKey) {
    const allRoutes = router.getRoutes();
    const meta = allRoutes.find((item) => item.name === key)?.meta || null;

    const query: Record<string, string> = {};

    for (const item of meta?.query ?? []) {
      query[item.key] = item.value;
    }

    return routerPushByKey(key, { query });
  }

  async function toHome() {
    return routerPushByKey('root');
  }

  /**
   * Navigate to the login page
   *
   * @param loginModule The login module
   * @param redirectUrl The redirect url, if not specified, it will be the current route fullPath
   */
  async function toLogin(loginModule?: UnionKey.LoginModule, redirectUrl?: string) {
    const module = loginModule || 'pwd-login';

    const options: App.Global.RouterPushOptions = {
      params: {
        module,
      },
    };

    const redirect = redirectUrl || route.value.fullPath;

    options.query = {
      redirect,
    };

    return routerPushByKey('login', options);
  }

  /** Toggle the login module */
  async function toggleLoginModule(module: UnionKey.LoginModule) {
    const query = route.value.query as Record<string, string>;

    return routerPushByKey('login', { query, params: { module } });
  }

  /**
   * Redirect from the login page
   *
   * @param [needRedirect=true] Whether to redirect after login. Default is `true`
   */
  async function redirectFromLogin(needRedirect = true) {
    const redirect = route.value.query.redirect as string | undefined;

    await (needRedirect && redirect ? routerPush(redirect) : toHome());
  }

  return {
    routerPush,
    routerBack,
    routerPushByKey,
    routerPushByKeyWithMetaQuery,
    toHome,
    toLogin,
    toggleLoginModule,
    redirectFromLogin,
  };
}
