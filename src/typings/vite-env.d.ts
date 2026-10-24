/// <reference types="vite/client" />

/**
 * Namespace Env
 *
 * It is used to declare the type of the import.meta object
 */
declare namespace Env {
  /** The router history mode */
  type RouterHistoryMode = 'hash' | 'history' | 'memory';

  /** Interface for import.meta */
  interface ImportMeta extends ImportMetaEnv {
    /** The base url of the application */
    readonly VITE_BASE_URL: string;
    /** The title of the application */
    readonly VITE_APP_TITLE: string;
    /** The description of the application */
    readonly VITE_APP_DESC: string;
    /** The router history mode */
    readonly VITE_ROUTER_HISTORY_MODE?: RouterHistoryMode;
    /** The prefix of the icon */
    readonly VITE_ICON_PREFIX: 'icon';
    /**
     * The prefix of the local icon
     *
     * This prefix starts with the icon prefix
     */
    readonly VITE_ICON_LOCAL_PREFIX: 'icon-local';
    /** The backend service base url */
    readonly VITE_SERVICE_BASE_URL: string;
    /**
     * Success code of the backend service
     *
     * When the code is received, the request is successful
     */
    readonly VITE_SERVICE_SUCCESS_CODE: string;
    /**
     * Logout codes of the backend service
     *
     * When the code is received, the user will be logged out and redirected to the login page
     *
     * Use "," to separate multiple codes
     */
    readonly VITE_SERVICE_LOGOUT_CODES: string;
    /**
     * Modal logout codes of the backend service
     *
     * When the code is received, the user will be logged out by displaying a modal
     *
     * Use "," to separate multiple codes
     */
    readonly VITE_SERVICE_MODAL_LOGOUT_CODES: string;
    /** When the route mode is static, the defined super role */
    readonly VITE_STATIC_SUPER_ROLE: string;
    /**
     * Other backend service base url
     *
     * The value is a json
     */
    readonly VITE_OTHER_SERVICE_BASE_URL?: string;
    /**
     * Whether to enable the http proxy
     *
     * Only valid in the development environment
     */
    readonly VITE_HTTP_PROXY?: CommonType.YesOrNo;
    /** The proxy target of the http proxy */
    readonly VITE_PROXY_TARGET?: string;
    /**
     * The auth route mode
     *
     * - static: the auth routes are generated in the front-end
     * - dynamic: the auth routes are generated in the back-end
     */
    readonly VITE_AUTH_ROUTE_MODE: 'static' | 'dynamic';
    /**
     * The home route key
     *
     * It only has effect when the auth route mode is static. If the route mode is dynamic, the home route key is
     * defined in the back-end
     */
    readonly VITE_ROUTE_HOME: import('@/router/route-key').LastLevelRouteKey;
    /**
     * Default menu icon if the menu icon is not set
     */
    readonly VITE_MENU_ICON: string;
    /** Whether to build with sourcemap */
    readonly VITE_SOURCE_MAP?: CommonType.YesOrNo;
    /** Iconify api provider url */
    readonly VITE_ICONIFY_URL?: string;
    /** Used to differentiate storage across different domains */
    readonly VITE_STORAGE_PREFIX?: string;
    /** Whether to automatically detect updates after the application is packaged */
    readonly VITE_AUTOMATICALLY_DETECT_UPDATE?: CommonType.YesOrNo;
    /** Password used when creating a user from the frontend (RuoYi requires one) */
    readonly VITE_DEFAULT_USER_PASSWORD?: string;
    /** Show proxy url log in terminal */
    readonly VITE_PROXY_LOG?: CommonType.YesOrNo;
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta;
}
