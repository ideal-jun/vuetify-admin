declare namespace Api {
  /**
   * namespace Auth
   *
   * backend auth responses are consumed directly.
   */
  namespace Auth {
    /** The logged-in user information returned by GET /system/user/getInfo */
    interface UserInfo {
      user: Api.Backend.User;
      roles: string[];
      permissions: string[];
    }

    /** The captcha code and uuid sent with POST /auth/login */
    interface LoginCaptcha {
      code: string;
      uuid: string;
    }

    type Captcha = Api.Backend.Captcha;
  }
}
