import type { App } from 'vue';

import { $t } from '@/locales';

export function setupAppErrorHandle(app: App) {
  app.config.errorHandler = (err, vm, info) => {
    console.error(err, vm, info);
  };
}

const UPDATE_CHECK_INTERVAL = 3 * 60 * 1000;

/** Poll the build time of the deployed html and notify the user when a new version is available */
export function setupAppVersionNotification() {
  const canAutoUpdate =
    import.meta.env.VITE_AUTOMATICALLY_DETECT_UPDATE === 'Y' && import.meta.env.PROD;

  if (!canAutoUpdate) {
    return;
  }

  let isShow = false;
  let updateInterval: ReturnType<typeof setInterval> | undefined;

  const checkForUpdates = async () => {
    if (isShow) {
      return;
    }

    const buildTime = await getHtmlBuildTime();

    if (!buildTime || buildTime === BUILD_TIME) {
      return;
    }

    isShow = true;

    window.$notification?.info({
      title: $t('system.updateTitle'),
      content: $t('system.updateContent'),
      duration: 0,
    });

    setTimeout(() => {
      isShow = false;
    }, UPDATE_CHECK_INTERVAL);
  };

  const startUpdateInterval = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    updateInterval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
  };

  if (!isShow && document.visibilityState === 'visible') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
        startUpdateInterval();
      }
    });

    startUpdateInterval();
  }
}

async function getHtmlBuildTime(): Promise<string | null> {
  const baseUrl = import.meta.env.VITE_BASE_URL || '/';

  try {
    const res = await fetch(`${baseUrl}index.html?time=${Date.now()}`);

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const match = html.match(/<meta name="buildTime" content="(.*)">/);

    return match?.[1] || null;
  } catch (error) {
    console.error('getHtmlBuildTime error:', error);

    return null;
  }
}
