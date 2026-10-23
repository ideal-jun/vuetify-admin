declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }

    interface LoginParams {
      userName: string;
      password: string;
    }

    interface CaptchaResult {
      sent: boolean;
    }

    interface ResetPasswordResult {
      sent: boolean;
    }
  }
}
