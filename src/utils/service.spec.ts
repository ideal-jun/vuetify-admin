import { describe, expect, it } from 'vitest';

import { env } from '@/env';

import { getServiceBaseURL } from './service';

describe('service base url', () => {
  it('uses the configured dev proxy prefix so the Vite proxy matches the request urls', () => {
    expect(env.serviceBaseURL.startsWith('/')).toBe(true);
    expect(getServiceBaseURL(true).baseURL).toBe(env.serviceBaseURL);
  });

  it('uses the configured base url when the proxy is disabled', () => {
    expect(getServiceBaseURL(false).baseURL).toBe(env.serviceBaseURL);
  });
});
