import { request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(userName: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'POST',
    data: {
      userName,
      password,
    },
  });
}

/**
 * Send a login captcha
 *
 * @param phone The phone number
 */
export function fetchSendCaptcha(phone: string) {
  return request<Api.Auth.CaptchaResult>({
    url: '/auth/sendCaptcha',
    method: 'POST',
    data: { phone },
  });
}

/**
 * Login with a phone captcha
 *
 * @param phone The phone number
 * @param code The captcha code
 */
export function fetchCodeLogin(phone: string, code: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/codeLogin',
    method: 'POST',
    data: { phone, code },
  });
}

/**
 * Request a password reset
 *
 * @param account The user name or phone number
 */
export function fetchResetPassword(account: string) {
  return request<Api.Auth.ResetPasswordResult>({
    url: '/auth/resetPassword',
    method: 'POST',
    data: { account },
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/auth/getUserInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'POST',
    data: {
      refreshToken,
    },
  });
}

/**
 * Return a custom backend error
 *
 * @param code Error code
 * @param msg Error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
