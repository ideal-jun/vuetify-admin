import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { router } from '@/router';
import { fetchCodeLogin, fetchGetUserInfo, fetchLogin, fetchRefreshToken } from '@/service/api';
import { localStg } from '@/utils/storage';

import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const token = ref(getToken());

  const userInfo = reactive<Api.Auth.UserInfo>({
    userId: '',
    userName: '',
    roles: [],
    buttons: [],
  });

  const loginLoading = ref(false);

  /** Is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Record the user id of the previous login session */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /** Clear all tabs when the current user is different from the previous one */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');

      const tabStore = useTabStore();

      void tabStore.clearTabs();

      localStg.remove('lastLoginUserId');

      return true;
    }

    localStg.remove('lastLoginUserId');

    return false;
  }

  /** Reset the auth store */
  async function resetStore() {
    recordUserId();

    const routeStore = useRouteStore();
    const tabStore = useTabStore();

    clearAuthStorage();

    token.value = '';
    Object.assign(userInfo, {
      userId: '',
      userName: '',
      roles: [],
      buttons: [],
    });

    tabStore.cacheTabs();

    await routeStore.resetStore();

    const currentRoute = router.currentRoute.value;

    if (!currentRoute.meta.constant) {
      await router.push({
        name: 'login',
        query: {
          redirect: currentRoute.fullPath,
        },
      });
    }
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. Store the tokens in localStorage, later requests need them in headers
    localStg.set('token', loginToken.token);
    localStg.set('refreshToken', loginToken.refreshToken);

    // 2. Get the user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginToken.token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data, error } = await fetchGetUserInfo();

    if (!error) {
      Object.assign(userInfo, data);

      return true;
    }

    return false;
  }

  /** Finish a successful login: persist the token, load user info and redirect */
  async function completeLogin(loginToken: Api.Auth.LoginToken, redirect: boolean) {
    const pass = await loginByToken(loginToken);

    if (!pass) {
      return false;
    }

    const isClear = checkTabClear();
    const needRedirect = isClear ? false : redirect;
    const redirectPath = router.currentRoute.value.query.redirect as string | undefined;

    await router.push(needRedirect && redirectPath ? redirectPath : { name: 'root' });

    window.$notification?.success({
      title: $t('page.login.common.loginSuccess'),
      content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
      duration: 4500,
    });

    return true;
  }

  /**
   * Login with a user name and password
   *
   * @param userName User name
   * @param password Password
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, redirect = true) {
    loginLoading.value = true;

    try {
      const { data: loginToken, error } = await fetchLogin(userName, password);

      if (error) {
        return false;
      }

      return await completeLogin(loginToken, redirect);
    } finally {
      loginLoading.value = false;
    }
  }

  /**
   * Login with a phone captcha
   *
   * @param phone The phone number
   * @param code The captcha code
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function loginByCode(phone: string, code: string, redirect = true) {
    loginLoading.value = true;

    try {
      const { data: loginToken, error } = await fetchCodeLogin(phone, code);

      if (error) {
        return false;
      }

      return await completeLogin(loginToken, redirect);
    } finally {
      loginLoading.value = false;
    }
  }

  async function initUserInfo() {
    const maybeToken = getToken();

    if (maybeToken) {
      token.value = maybeToken;

      const pass = await getUserInfo();

      if (!pass) {
        await resetStore();
      }
    }
  }

  /** Refresh the token, it is used by the request layer */
  async function refreshToken() {
    const refreshTokenValue = localStg.get('refreshToken') || '';
    const { data, error } = await fetchRefreshToken(refreshTokenValue);

    if (!error) {
      localStg.set('token', data.token);
      localStg.set('refreshToken', data.refreshToken);
      token.value = data.token;

      return true;
    }

    await resetStore();

    return false;
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    loginByCode,
    initUserInfo,
    refreshToken,
  };
});
