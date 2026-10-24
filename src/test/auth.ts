import { setActivePinia } from 'pinia';

import { useAuthStore } from '@/store/modules/auth';
import getInfoFixture from '@/test/fixtures/backend/get-info.json';
import { localStg } from '@/utils/storage';

import { pinia } from './setup';

interface TestAuthOptions {
  /** The permission codes granted to the test user */
  permissions?: string[];
  /** The roles of the test user */
  roles?: string[];
}

/** Prepare a signed-in backend user for component tests that render permission-gated buttons */
export function setupTestAuth({
  permissions = ['*:*:*'],
  roles = ['admin'],
}: TestAuthOptions = {}) {
  setActivePinia(pinia);

  localStg.set('token', 'test-token');

  const authStore = useAuthStore();

  authStore.token = 'test-token';
  authStore.userInfo.user = { ...(getInfoFixture.user as Api.Backend.User) };
  authStore.userInfo.roles = roles;
  authStore.userInfo.permissions = permissions;
}
