import { setActivePinia } from 'pinia';

import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';

import { pinia } from './setup';

interface TestAuthOptions {
  /** The permission codes granted to the test user */
  buttons?: string[];
  /** The roles of the test user */
  roles?: string[];
}

/** Prepare a signed-in user for component tests that render permission-gated buttons */
export function setupTestAuth({
  buttons = ['*'],
  roles = ['R_SUPER', 'R_ADMIN'],
}: TestAuthOptions = {}) {
  setActivePinia(pinia);

  localStg.set('token', 'test-token');

  const authStore = useAuthStore();

  authStore.token = 'test-token';
  authStore.userInfo.userId = '1';
  authStore.userInfo.userName = 'Admin';
  authStore.userInfo.roles = roles;
  authStore.userInfo.buttons = buttons;
}
