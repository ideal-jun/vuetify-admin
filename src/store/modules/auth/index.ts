import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { router } from '@/router';
import { fetchGetUserInfo, fetchLogin, fetchLogout } from '@/service/api';
import { localStg } from '@/utils/storage';

import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const token = ref(getToken());

  const userInfo = reactive<Api.Auth.UserInfo>({
    user: {} as Api.RuoYi.User,
    roles: [],
    permissions: [],
  });

  const loginLoading = ref(false);

  /** Is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** The current user id as a storage-friendly string */
  function getUserId() {
    return userInfo.user.userId ? String(userInfo.user.userId) : '';
  }

  /** Record the user id of the previous login session */
  function recordUserId() {
    const userId = getUserId();

    if (!userId) {
      return;
    }

    localStg.set('lastLoginUserId', userId);
  }

  /** Clear all tabs when the current user is different from the previous one */
  function checkTabClear(): boolean {
    const userId = getUserId();

    if (!userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    if (!lastLoginUserId || lastLoginUserId !== userId) {
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

    // Best effort: end the backend session, but never block the UI on it.
    void fetchLogout();

    clearAuthStorage();

    token.value = '';
    Object.assign(userInfo, {
      user: {} as Api.RuoYi.User,
      roles: [],
      permissions: [],
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

  /** Persist the token, then load the user info before completing the login */
  async function loginByToken(loginData: Api.RuoYi.LoginData) {
    // 1. Store the token in localStorage, later requests need it in the headers
    localStg.set('token', loginData.access_token);

    // 2. Get the user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginData.access_token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data, error } = await fetchGetUserInfo();

    if (!error) {
      userInfo.user = data.user;
      userInfo.roles = data.roles;
      userInfo.permissions = data.permissions;

      return true;
    }

    return false;
  }

  /** Finish a successful login: persist the token, load user info and redirect */
  async function completeLogin(loginData: Api.RuoYi.LoginData, redirect: boolean) {
    const pass = await loginByToken(loginData);

    if (!pass) {
      return false;
    }

    const isClear = checkTabClear();
    const needRedirect = isClear ? false : redirect;
    const redirectPath = router.currentRoute.value.query.redirect as string | undefined;

    await router.push(needRedirect && redirectPath ? redirectPath : { name: 'root' });

    window.$notification?.success({
      title: $t('page.login.common.loginSuccess'),
      content: $t('page.login.common.welcomeBack', { userName: userInfo.user.userName }),
      duration: 4500,
    });

    return true;
  }

  /**
   * Login with a user name, a password and the optional captcha
   *
   * @param userName User name
   * @param password Password
   * @param captcha The captcha code and uuid, sent when the captcha is enabled
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(
    userName: string,
    password: string,
    captcha?: Api.Auth.LoginCaptcha,
    redirect = true,
  ) {
    loginLoading.value = true;

    try {
      const { data: loginData, error } = await fetchLogin(userName, password, captcha);

      if (error) {
        return false;
      }

      return await completeLogin(loginData, redirect);
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

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo,
  };
});
