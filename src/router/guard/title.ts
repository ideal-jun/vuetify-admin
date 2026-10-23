import type { Router } from 'vue-router';

import { $t } from '@/locales';

/** Set the document title by route meta and locale */
export function createDocumentTitleGuard(router: Router) {
  router.afterEach((to) => {
    const { i18nKey, title } = to.meta;

    const documentTitle = i18nKey ? $t(i18nKey) : title;

    document.title = documentTitle
      ? `${documentTitle} · ${$t('system.title')}`
      : $t('system.title');
  });
}
