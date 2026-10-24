/** The global namespace for the app */
declare namespace App {
  /** Theme namespace */
  namespace Theme {
    type ColorPaletteNumber = import('@/utils/color').ColorPaletteNumber;

    /** Theme setting */
    interface ThemeSetting {
      /** Theme scheme */
      themeScheme: UnionKey.ThemeScheme;
      /** Grayscale mode */
      grayscale: boolean;
      /** Color weakness mode */
      colourWeakness: boolean;
      /** Whether to recommend color */
      recommendColor: boolean;
      /** Theme color */
      themeColor: string;
      /** Theme radius */
      themeRadius: number;
      /** Other colors */
      otherColor: OtherColor;
      /** Whether info color follows the primary color */
      isInfoFollowPrimary: boolean;
      /** Layout */
      layout: {
        /** Layout mode */
        mode: UnionKey.ThemeLayoutMode;
        /** Scroll mode */
        scrollMode: UnionKey.ThemeScrollMode;
      };
      /** Page */
      page: {
        /** Whether to show the page transition */
        animate: boolean;
        /** Page animate mode */
        animateMode: UnionKey.ThemePageAnimateMode;
      };
      /** Header */
      header: {
        /** Header height */
        height: number;
        /** Breadcrumb */
        breadcrumb: {
          /** Whether to show the breadcrumb */
          visible: boolean;
          /** Whether to show the breadcrumb icon */
          showIcon: boolean;
        };
        /** Multilingual */
        multilingual: {
          /** Whether to show the multilingual switch */
          visible: boolean;
        };
        /** Global search */
        globalSearch: {
          /** Whether to show the global search */
          visible: boolean;
        };
      };
      /** Tab */
      tab: {
        /** Whether to show the tab */
        visible: boolean;
        /**
         * Whether to cache the tab
         *
         * If cache, the tabs will be restored from local storage when the page is refreshed
         */
        cache: boolean;
        /** Tab height */
        height: number;
        /** Tab mode */
        mode: UnionKey.ThemeTabMode;
        /** Whether to close a tab by middle click */
        closeTabByMiddleClick: boolean;
      };
      /** Sider */
      sider: {
        /** Inverted sider */
        inverted: boolean;
        /** Sider width */
        width: number;
        /** Collapsed sider width */
        collapsedWidth: number;
        /** Sider width when the layout is a mix layout */
        mixWidth: number;
        /** Collapsed sider width when the layout is a mix layout */
        mixCollapsedWidth: number;
        /** Child menu width when the layout is a mix layout */
        mixChildMenuWidth: number;
      };
      /** Footer */
      footer: {
        /** Whether to show the footer */
        visible: boolean;
        /** Footer height */
        height: number;
        /** Whether the footer floats to the right in hybrid layouts */
        right: boolean;
      };
      /** Watermark */
      watermark: {
        /** Whether to show the watermark */
        visible: boolean;
        /** Watermark text */
        text: string;
        /** Whether to use the user name as the watermark text */
        enableUserName: boolean;
        /** Whether to use the current time as the watermark text */
        enableTime: boolean;
        /** Time format for the watermark text */
        timeFormat: string;
      };
      /** Theme settings tokens, they are transformed to CSS variables */
      tokens: {
        light: ThemeSettingToken;
        dark?: {
          [K in keyof ThemeSettingToken]?: Partial<ThemeSettingToken[K]>;
        };
      };
    }

    interface OtherColor {
      info: string;
      success: string;
      warning: string;
      error: string;
    }

    interface ThemeColor extends OtherColor {
      primary: string;
    }

    type ThemeColorKey = keyof ThemeColor;

    type ThemePaletteColor = {
      [key in ThemeColorKey | `${ThemeColorKey}-${ColorPaletteNumber}`]: string;
    };

    type BaseToken = Record<string, Record<string, string>>;

    interface ThemeSettingTokenColor {
      /** The progress bar color, if not set, the primary color is used */
      nprogress?: string;
      container: string;
      layout: string;
      inverted: string;
      'base-text': string;
    }

    interface ThemeSettingTokenBoxShadow {
      header: string;
      sider: string;
      tab: string;
    }

    interface ThemeSettingToken {
      colors: ThemeSettingTokenColor;
      boxShadow: ThemeSettingTokenBoxShadow;
    }

    type ThemeTokenColor = ThemePaletteColor & ThemeSettingTokenColor;

    /** Theme token CSS variables */
    type ThemeTokenCSSVars = {
      colors: ThemeTokenColor & { [key: string]: string };
      boxShadow: ThemeSettingTokenBoxShadow & { [key: string]: string };
    };

    /** Theme preset declared by a json file */
    interface ThemePreset extends Partial<ThemeSetting> {
      name: string;
      desc: string;
      i18nkey?: App.I18n.I18nKey;
      version: string;
    }
  }

  /** Global namespace */
  namespace Global {
    type VNode = import('vue').VNode;
    type RouteLocationNormalizedLoaded = import('vue-router').RouteLocationNormalizedLoaded;
    type RouteKey = import('@/router/route-key').RouteKey;
    type RouteMap = import('@/router/route-key').RouteMap;
    type RoutePath = import('@/router/route-key').RoutePath;
    type LastLevelRouteKey = import('@/router/route-key').LastLevelRouteKey;

    /** The router push options */
    type RouterPushOptions = {
      query?: Record<string, string>;
      params?: Record<string, string>;
      force?: boolean;
    };

    /** The global menu */
    type Menu = {
      /**
       * The menu key
       *
       * Equal to the route key
       */
      key: string;
      /** The menu label */
      label: string;
      /** The menu i18n key */
      i18nKey?: I18n.I18nKey | null;
      /** The route key */
      routeKey: RouteKey;
      /** The route path */
      routePath: RoutePath;
      /** The menu icon */
      icon?: string;
      /** The menu children */
      children?: Menu[];
    };

    type Breadcrumb = Omit<Menu, 'children'> & {
      options?: Breadcrumb[];
    };

    /** Tab route */
    type TabRoute = Pick<RouteLocationNormalizedLoaded, 'name' | 'path' | 'meta'> &
      Partial<Pick<RouteLocationNormalizedLoaded, 'fullPath' | 'query' | 'matched'>>;

    /** The global tab */
    type Tab = {
      /** The tab id */
      id: string;
      /** The tab label */
      label: string;
      /**
       * The new tab label
       *
       * If set, the tab label will be replaced by this value
       */
      newLabel?: string;
      /**
       * The old tab label
       *
       * When resetting the tab label, the tab label will be replaced by this value
       */
      oldLabel?: string;
      /** The tab route key */
      routeKey: LastLevelRouteKey;
      /** The tab route path */
      routePath: string;
      /** The tab route full path */
      fullPath: string;
      /** The tab fixed index */
      fixedIndex?: number | null;
      /** Tab icon */
      icon?: string;
      /** Tab local icon */
      localIcon?: string;
      /** I18n key */
      i18nKey?: I18n.I18nKey | null;
    };

    /** Form rule */
    type FormRule = (value: unknown) => true | string;

    /** The global dropdown key */
    type DropdownKey =
      | 'closeCurrent'
      | 'closeOther'
      | 'closeLeft'
      | 'closeRight'
      | 'closeAll'
      | 'pin'
      | 'unpin';

    /** A message severity */
    type MessageType = 'success' | 'error' | 'warning' | 'info';

    interface MessageApi {
      success: (content: string) => void;
      error: (content: string) => void;
      warning: (content: string) => void;
      info: (content: string) => void;
    }

    interface DialogOptions {
      title?: string;
      content: string;
      positiveText?: string;
      negativeText?: string;
      onPositiveClick?: () => void | Promise<void>;
      onNegativeClick?: () => void | Promise<void>;
      onClose?: () => void;
      maskClosable?: boolean;
    }

    interface DialogApi {
      info: (options: DialogOptions) => void;
      success: (options: DialogOptions) => void;
      warning: (options: DialogOptions) => void;
      error: (options: DialogOptions) => void;
    }

    interface NotificationOptions {
      title: string;
      content: string;
      duration?: number;
    }

    interface NotificationApi {
      success: (options: NotificationOptions) => void;
      info: (options: NotificationOptions) => void;
      warning: (options: NotificationOptions) => void;
      error: (options: NotificationOptions) => void;
    }
  }

  /**
   * I18n namespace
   *
   * Locale types
   */
  namespace I18n {
    type LangType = 'en-US' | 'zh-CN';

    type LangOption = {
      label: string;
      key: LangType;
    };

    /** The locale schema is derived from the English locale, other locales must match it */
    type Schema = typeof import('@/locales/langs/en-us').default;

    type GetI18nKey<
      T extends Record<string, unknown>,
      K extends keyof T = keyof T,
    > = K extends string
      ? T[K] extends Record<string, unknown>
        ? `${K}.${GetI18nKey<T[K]>}`
        : K
      : never;

    type I18nKey = GetI18nKey<Schema>;

    type TranslateOptions<Locales extends string> = import('vue-i18n').TranslateOptions<Locales>;

    interface $T {
      (key: I18nKey): string;
      (key: I18nKey, plural: number, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, defaultMsg: string, options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], plural: number): string;
      (key: I18nKey, list: unknown[], defaultMsg: string): string;
      (key: I18nKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, named: Record<string, unknown>, plural: number): string;
      (key: I18nKey, named: Record<string, unknown>, defaultMsg: string): string;
    }
  }

  /** Service namespace */
  namespace Service {
    /** Other baseURL key */
    type OtherBaseURLKey = 'demo';

    interface ServiceConfigItem {
      /** The backend service base url */
      baseURL: string;
      /** The proxy pattern of the backend service base url */
      proxyPattern: string;
    }

    interface OtherServiceConfigItem extends ServiceConfigItem {
      key: OtherBaseURLKey;
    }

    /** The backend service config */
    interface ServiceConfig extends ServiceConfigItem {
      /** Other backend service config */
      other: OtherServiceConfigItem[];
    }

    interface SimpleServiceConfig extends Pick<ServiceConfigItem, 'baseURL'> {
      other: Record<OtherBaseURLKey, string>;
    }

    /** The backend service response data */
    type Response<T = unknown> = {
      /** The backend service response code */
      code: string;
      /** The backend service response message */
      msg: string;
      /** The backend service response data */
      data: T;
    };

    /** The demo backend service response data */
    type DemoResponse<T = unknown> = {
      /** The demo backend service response status */
      status: string;
      /** The demo backend service response message */
      message: string;
      /** The demo backend service response data */
      result: T;
    };

    type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

    /** The request config of the flat request */
    interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> {
      /** The request url, it is relative to the service base url */
      url: string;
      /** The request method */
      method?: RequestMethod;
      /** The query params */
      params?: Record<string, unknown>;
      /** The request body, it will be serialized to JSON */
      data?: unknown;
      /** Whether to carry the Authorization header */
      withToken?: boolean;
    }

    /** The request error */
    interface RequestError {
      /** The error code */
      code: string;
      /** The error message */
      message: string;
      /** The HTTP status */
      status?: number;
    }

    /** The flat response data */
    type FlatResponseData<T> =
      | {
          data: T;
          error: null;
          response?: Response;
        }
      | {
          data: null;
          error: RequestError;
          response?: Response;
        };

    type FlatRequest = <T>(config: RequestConfig) => Promise<FlatResponseData<T>>;

    /** The request instance state */
    interface RequestInstanceState {
      /** The request error message stack */
      errMsgStack: string[];
    }
  }
}
