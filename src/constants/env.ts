import { env } from '@/env';

/** Whether the app is running in the development environment */
export const isDev = env.isDev;

/** Whether the app is running in the production environment */
export const isProd = env.isProd;
