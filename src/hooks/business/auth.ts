import { useAuthStore } from '@/store/modules/auth';

export function useAuth() {
  const authStore = useAuthStore();

  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    const { buttons } = authStore.userInfo;

    if (authStore.isStaticSuper || buttons.includes('*')) {
      return true;
    }

    const requiredCodes = typeof codes === 'string' ? [codes] : codes;

    return requiredCodes.some((code) => buttons.includes(code));
  }

  return {
    hasAuth,
  };
}
