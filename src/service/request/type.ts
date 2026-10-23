export type RequestInstanceState = App.Service.RequestInstanceState;

export interface RequestHandlers {
  /** Called when the backend asks the client to log out */
  onUnauthorized?: () => void | Promise<void>;
  /** Called when the token has expired, return true if the token was refreshed */
  onTokenExpired?: () => Promise<boolean>;
}
