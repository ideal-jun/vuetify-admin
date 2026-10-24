export type RequestInstanceState = App.Service.RequestInstanceState;

export interface RequestHandlers {
  /** Called when the backend asks the client to log out */
  onUnauthorized?: () => void | Promise<void>;
}
