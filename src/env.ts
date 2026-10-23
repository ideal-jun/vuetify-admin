const appTitle = import.meta.env.VITE_APP_TITLE?.trim() || 'Vuetify Admin';
const appDesc = import.meta.env.VITE_APP_DESC?.trim() || 'A fresh and elegant admin template.';
const serviceBaseURL = (import.meta.env.VITE_SERVICE_BASE_URL || '/api').trim();
const baseURL = (import.meta.env.VITE_BASE_URL || '/').trim();
const routerHistoryMode = import.meta.env.VITE_ROUTER_HISTORY_MODE || 'history';
const authRouteMode = import.meta.env.VITE_AUTH_ROUTE_MODE || 'static';
const routeHome = import.meta.env.VITE_ROUTE_HOME || 'home';
const menuIcon = import.meta.env.VITE_MENU_ICON || 'mdi-menu';
const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || '';
const isMock = import.meta.env.VITE_SERVICE_MOCK !== 'N';

if (!serviceBaseURL.startsWith('/') && !/^https?:\/\//u.test(serviceBaseURL)) {
  throw new Error('VITE_SERVICE_BASE_URL must start with "/" or be an absolute http(s) URL.');
}

if (!baseURL.startsWith('/')) {
  throw new Error('VITE_BASE_URL must start with "/".');
}

if (!['hash', 'history', 'memory'].includes(routerHistoryMode)) {
  throw new Error('VITE_ROUTER_HISTORY_MODE must be one of "hash", "history" or "memory".');
}

if (!['static', 'dynamic'].includes(authRouteMode)) {
  throw new Error('VITE_AUTH_ROUTE_MODE must be "static" or "dynamic".');
}

export const env = {
  appTitle,
  appDesc,
  baseURL,
  serviceBaseURL,
  routerHistoryMode: routerHistoryMode as Env.RouterHistoryMode,
  authRouteMode: authRouteMode as 'static' | 'dynamic',
  routeHome: routeHome as App.Global.LastLevelRouteKey,
  menuIcon,
  storagePrefix,
  isMock,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
