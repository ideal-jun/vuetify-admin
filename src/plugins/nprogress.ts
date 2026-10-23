import NProgress from 'nprogress';

/** Setup the NProgress plugin */
export function setupNProgress() {
  NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

  window.NProgress = NProgress;
}
