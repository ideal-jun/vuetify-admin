const appTitle = import.meta.env.VITE_APP_TITLE?.trim() || 'Vuetify Admin';
const appDesc = import.meta.env.VITE_APP_DESC?.trim() || 'A fresh and elegant admin template.';
const serviceBaseURL = (import.meta.env.VITE_SERVICE_BASE_URL || '/api').trim();
const baseURL = (import.meta.env.VITE_BASE_URL || '/').trim();
const routerHistoryMode = import.meta.env.VITE_ROUTER_HISTORY_MODE || 'history';
const authRouteMode = import.meta.env.VITE_AUTH_ROUTE_MODE || 'static';
const routeHome = import.meta.env.VITE_ROUTE_HOME || 'home';
const menuIcon = import.meta.env.VITE_MENU_ICON || 'mdi-menu';
const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || '';
const defaultUserPassword = import.meta.env.VITE_DEFAULT_USER_PASSWORD?.trim() || 'admin123';

/** Parse a comma separated list of backend service codes */
function parseServiceCodes(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);
}

/**
 * Backend service codes
 *
 * They are centralized here so a misconfigured environment is validated at startup instead of being silently
 * treated as an error response by the request layer.
 */
const serviceCodes = {
  success: (import.meta.env.VITE_SERVICE_SUCCESS_CODE || '200').trim(),
  logout: parseServiceCodes(import.meta.env.VITE_SERVICE_LOGOUT_CODES || '401'),
  modalLogout: parseServiceCodes(import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES),
};

if (!serviceCodes.success) {
  throw new Error('VITE_SERVICE_SUCCESS_CODE must not be empty.');
}

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
  serviceCodes,
  routerHistoryMode: routerHistoryMode as Env.RouterHistoryMode,
  authRouteMode: authRouteMode as 'static' | 'dynamic',
  routeHome: routeHome as App.Global.LastLevelRouteKey,
  menuIcon,
  storagePrefix,
  defaultUserPassword,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
