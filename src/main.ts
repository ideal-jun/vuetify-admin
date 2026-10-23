import { createApp } from 'vue';

import { getLocale, setupI18n } from '@/locales';
import {
  setupAppErrorHandle,
  setupAppVersionNotification,
  setupDayjs,
  setupGlobalFeedback,
  setupLoading,
  setupNProgress,
  setupRequest,
} from '@/plugins';

import './plugins/assets';
import vuetify from '@/plugins/vuetify';
import { setupRouter } from '@/router';
import { setupStore } from '@/store';

import App from './App.vue';

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupDayjs();

  setupGlobalFeedback();

  setupRequest();

  const app = createApp(App);

  setupStore(app);

  setupI18n(app);

  app.use(vuetify);

  await setupRouter(app);

  setupAppErrorHandle(app);

  setupAppVersionNotification();

  document.documentElement.lang = getLocale();

  app.mount('#app');
}

void setupApp();
