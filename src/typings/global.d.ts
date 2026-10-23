export {};

declare global {
  interface Window {
    /** NProgress instance */
    NProgress?: import('nprogress').NProgress;
    /** The global message API */
    $message?: App.Global.MessageApi;
    /** The global dialog API */
    $dialog?: App.Global.DialogApi;
    /** The global notification API */
    $notification?: App.Global.NotificationApi;
  }

  /** Build time of the project */
  const BUILD_TIME: string;
}
