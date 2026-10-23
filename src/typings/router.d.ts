import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Title of the route
     *
     * It can be used in document title
     */
    title: string;
    /**
     * I18n key of the route
     *
     * It is used in i18n, if it is set, the title will be ignored
     */
    i18nKey?: App.I18n.I18nKey | null;
    /**
     * Roles of the route
     *
     * Route can be accessed if the current user has at least one of the roles
     *
     * It only works when the route mode is "static", if the route mode is "dynamic", it will be ignored
     */
    roles?: string[];
    /** Whether to cache the route */
    keepAlive?: boolean | null;
    /**
     * Whether it is a constant route
     *
     * When set to true, there will be no login verification and no permission verification to access the route
     */
    constant?: boolean | null;
    /**
     * Icon
     *
     * It is used in the menu or breadcrumb
     */
    icon?: string;
    /** Local icon, in "src/assets/svg-icon" */
    localIcon?: string;
    /** Icon size. Width and height are the same. */
    iconFontSize?: number;
    /** Router order */
    order?: number | null;
    /** The outer link of the route */
    href?: string | null;
    /** Whether to hide the route in the menu */
    hideInMenu?: boolean | null;
    /**
     * The menu key will be activated when entering the route
     *
     * The route is not in the menu
     */
    activeMenu?: import('@/router/route-key').RouteKey | null;
    /**
     * By default, the same route path will use one tab, even with different query. If set true, the route with
     * different query will use different tabs
     */
    multiTab?: boolean | null;
    /** If set, the route will be fixed in tabs, and the value is the order of fixed tabs */
    fixedIndexInTab?: number | null;
    /** If set, the query parameters will be automatically carried when entering the route */
    query?: { key: string; value: string }[] | null;
    /**
     * Whether the route is only available in the development environment
     */
    isDev?: boolean;
  }
}
