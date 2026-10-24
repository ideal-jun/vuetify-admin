import { request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 * @param captcha The captcha code and uuid, sent when the captcha is enabled
 */
export function fetchLogin(userName: string, password: string, captcha?: Api.Auth.LoginCaptcha) {
  return request<Api.Backend.LoginData>({
    url: '/auth/login',
    method: 'POST',
    data: {
      username: userName,
      password,
      code: captcha?.code ?? '',
      uuid: captcha?.uuid ?? '',
    },
  });
}

/** Get the login captcha from GET /code */
export function fetchGetCaptcha() {
  return request<Api.Backend.Captcha>({
    url: '/code',
    headers: { Accept: 'text/plain' },
    withToken: false,
  });
}

/** Get the signed-in user info from GET /system/user/getInfo */
export function fetchGetUserInfo() {
  return request<Api.Backend.GetInfo>({ url: '/system/user/getInfo' });
}

/** Log out on the backend */
export function fetchLogout() {
  return request<null>({ url: '/auth/logout', method: 'DELETE' });
}
