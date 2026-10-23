import type { App } from 'vue';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import type { RouterHistory } from 'vue-router';

import { env } from '@/env';

import { createRouterGuard } from './guard';
import { createBuiltinVueRoutes } from './routes/builtin';

const historyCreatorMap: Record<Env.RouterHistoryMode, (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory,
};

export const router = createRouter({
  history: historyCreatorMap[env.routerHistoryMode](env.baseURL),
  routes: [],
  scrollBehavior: () => ({ top: 0 }),
});

let builtinRoutesAdded = false;

/** Add the builtin routes once, after the whole module graph is initialized */
export function setupBuiltinRoutes() {
  if (builtinRoutesAdded) {
    return;
  }

  for (const route of createBuiltinVueRoutes()) {
    router.addRoute(route);
  }

  builtinRoutesAdded = true;
}

/** Setup Vue Router */
export async function setupRouter(app: App) {
  // The builtin routes must exist before the router starts its initial navigation.
  setupBuiltinRoutes();

  app.use(router);

  createRouterGuard(router);

  await router.isReady();
}
