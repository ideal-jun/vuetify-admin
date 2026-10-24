import { describe, expect, it, vi } from 'vitest';

import { request } from '@/service/request';
import getInfoFixture from '@/test/fixtures/backend/get-info.json';

import { fetchGetCaptcha, fetchGetUserInfo, fetchLogin, fetchLogout } from './auth';

vi.mock('@/service/request', () => ({
  request: vi.fn(),
}));

const requestMock = vi.mocked(request);

describe('backend auth service', () => {
  it('posts the backend login payload and returns the login data as-is', async () => {
    requestMock.mockResolvedValueOnce({
      data: { access_token: 'ry-token', expires_in: 7200 },
      error: null,
    });

    const result = await fetchLogin('admin', 'admin123', { code: '1234', uuid: 'uuid-1' });

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ access_token: 'ry-token', expires_in: 7200 });
    expect(requestMock).toHaveBeenCalledWith({
      url: '/auth/login',
      method: 'POST',
      data: {
        username: 'admin',
        password: 'admin123',
        code: '1234',
        uuid: 'uuid-1',
      },
    });
  });

  it('passes the backend login error through', async () => {
    requestMock.mockResolvedValueOnce({
      data: null,
      error: { code: '500', message: 'Invalid captcha' },
    });

    const result = await fetchLogin('admin', 'wrong');

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Invalid captcha');
  });

  it('requests the captcha as plain text and returns the flat payload', async () => {
    const captcha = {
      code: 200,
      msg: '操作成功',
      img: 'data:image/jpeg;base64,abc',
      uuid: 'captcha-uuid',
      captchaEnabled: true,
    };

    requestMock.mockResolvedValueOnce({ data: captcha, error: null });

    const result = await fetchGetCaptcha();

    expect(result.data).toEqual(captcha);
    expect(requestMock).toHaveBeenCalledWith({
      url: '/code',
      headers: { Accept: 'text/plain' },
      withToken: false,
    });
  });

  it('requests getInfo and returns the flat payload as data', async () => {
    requestMock.mockResolvedValueOnce({ data: getInfoFixture, error: null });

    const result = await fetchGetUserInfo();

    expect(requestMock).toHaveBeenCalledWith({ url: '/system/user/getInfo' });
    expect(result.data).toEqual(getInfoFixture);
    expect(result.data?.user.userName).toBe('admin');
    expect(result.data?.permissions).toEqual(['*:*:*']);
  });

  it('logs out against the backend endpoint', async () => {
    requestMock.mockResolvedValueOnce({ data: null, error: null });

    await expect(fetchLogout()).resolves.toEqual({ data: null, error: null });
    expect(requestMock).toHaveBeenCalledWith({ url: '/auth/logout', method: 'DELETE' });
  });
});
