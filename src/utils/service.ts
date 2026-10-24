import { env } from '@/env';

/**
 * Create the service config by the current env
 */
export function createServiceConfig(): App.Service.ServiceConfig {
  const baseURL = env.serviceBaseURL;

  const config: App.Service.ServiceConfig = {
    baseURL,
    proxyPattern: createProxyPattern(),
    other: [],
  };

  return config;
}

/**
 * Get the backend service base url
 *
 * @param isProxy - if use proxy
 */
export function getServiceBaseURL(isProxy: boolean) {
  const { baseURL, other } = createServiceConfig();

  const otherBaseURL = {} as Record<App.Service.OtherBaseURLKey, string>;

  for (const item of other) {
    otherBaseURL[item.key] = isProxy ? item.proxyPattern : item.baseURL;
  }

  return {
    baseURL: isProxy ? createProxyPattern() : baseURL,
    otherBaseURL,
  };
}

/**
 * Get the proxy pattern of a backend service base url
 *
 * @param key If not set, the default key is used
 */
function createProxyPattern(key?: App.Service.OtherBaseURLKey) {
  if (key) {
    return `/proxy-${key}`;
  }

  // In development the default service base URL doubles as the Vite proxy prefix (see vite.config.mts).
  return env.serviceBaseURL.startsWith('/') ? env.serviceBaseURL : '/proxy-default';
}
