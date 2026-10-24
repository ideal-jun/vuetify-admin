import { describe, expect, it } from 'vitest';

import { env } from './env';

describe('env', () => {
  it('provides a title and a valid API base URL', () => {
    expect(env.appTitle.length).toBeGreaterThan(0);
    expect(env.serviceBaseURL.startsWith('/') || /^https?:\/\//u.test(env.serviceBaseURL)).toBe(
      true,
    );
  });

  it('provides a valid base url and auth route mode', () => {
    expect(env.baseURL.startsWith('/')).toBe(true);
    expect(env.authRouteMode).toBe('dynamic');
  });

  it('provides the RuoYi service codes', () => {
    expect(env.serviceCodes.success).toBe('200');
    expect(env.serviceCodes.logout).toContain('401');
  });
});
