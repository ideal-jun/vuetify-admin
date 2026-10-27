import { execFileSync } from 'node:child_process';

import type { APIRequestContext, Page } from '@playwright/test';

const STORAGE_PREFIX = 'vuetify-admin_';

function readCaptcha(uuid: string) {
  const output = execFileSync(
    'docker',
    [
      'exec',
      'redis',
      'redis-cli',
      '-a',
      '123456',
      '--no-auth-warning',
      'GET',
      `captcha_codes:${uuid}`,
    ],
    { encoding: 'utf8' },
  );

  return output.trim().replace(/^"|"$/gu, '');
}

/** Log in through the real gateway and return the access token */
export async function loginThroughApi(request: APIRequestContext) {
  const codeResponse = await request.get('/api/code', { headers: { Accept: 'text/plain' } });
  const { uuid } = (await codeResponse.json()) as { uuid: string };
  const code = readCaptcha(uuid);

  const loginResponse = await request.post('/api/auth/login', {
    data: { username: 'admin', password: 'admin123', code, uuid },
  });
  const payload = (await loginResponse.json()) as { data?: { access_token?: string } };
  const token = payload.data?.access_token;

  if (!token) {
    throw new Error(`Login failed: ${JSON.stringify(payload)}`);
  }

  return token;
}

/** Put the token into the same storage wrapper the app reads */
export async function installToken(page: Page, token: string) {
  await page.addInitScript(
    ([prefix, value]) => {
      localStorage.setItem(`${prefix}token`, JSON.stringify({ value }));
    },
    [STORAGE_PREFIX, token] as const,
  );

  await page.goto('/home');
}
