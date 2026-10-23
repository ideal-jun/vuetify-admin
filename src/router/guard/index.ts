import type { Router } from 'vue-router';

import { createProgressGuard } from './progress';
import { createRouteGuard } from './route';
import { createDocumentTitleGuard } from './title';

/**
 * Create all router guards
 *
 * @param router Router instance
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  createRouteGuard(router);
  createDocumentTitleGuard(router);
}
