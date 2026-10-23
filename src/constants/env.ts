import { env } from '@/env';

/** Whether the app is running in the development environment */
export const isDev = env.isDev;

/** Whether the app is running in the production environment */
export const isProd = env.isProd;

/** Whether the built-in mock service is enabled */
export const isMock = env.isMock;
