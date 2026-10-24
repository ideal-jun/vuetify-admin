import { useAuthStore } from '@/store/modules/auth';

export function useAuth() {
  const authStore = useAuthStore();

  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    const { permissions } = authStore.userInfo;

    // RuoYi uses "*:*:*" for a user that is allowed to do everything.
    if (authStore.isStaticSuper || permissions.includes('*') || permissions.includes('*:*:*')) {
      return true;
    }

    const requiredCodes = typeof codes === 'string' ? [codes] : codes;

    return requiredCodes.some((code) => permissions.includes(code));
  }

  return {
    hasAuth,
  };
}
