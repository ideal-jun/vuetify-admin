import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '@/store/modules/auth';

import { useAuth } from './auth';

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setup(permissions: string[], token = 'test-token') {
    const authStore = useAuthStore();

    authStore.token = token;
    authStore.userInfo.permissions = permissions;

    return useAuth();
  }

  it('grants every permission for the wildcard code', () => {
    const { hasAuth } = setup(['*']);

    expect(hasAuth('system:user:add')).toBe(true);
    expect(hasAuth(['anything', 'else'])).toBe(true);
  });

  it('grants every permission for the backend wildcard', () => {
    const { hasAuth } = setup(['*:*:*']);

    expect(hasAuth('system:user:add')).toBe(true);
    expect(hasAuth(['anything', 'else'])).toBe(true);
  });

  it('matches a single code or any code in an array', () => {
    const { hasAuth } = setup(['system:user:view', 'system:user:edit']);

    expect(hasAuth('system:user:view')).toBe(true);
    expect(hasAuth(['system:user:delete', 'system:user:edit'])).toBe(true);
    expect(hasAuth(['system:user:delete', 'system:role:edit'])).toBe(false);
  });

  it('rejects every permission when the user is not logged in', () => {
    const { hasAuth } = setup(['*'], '');

    expect(hasAuth('system:user:view')).toBe(false);
  });
});
