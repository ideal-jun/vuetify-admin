import { setupRequestHandlers } from '@/service/request';
import { useAuthStore } from '@/store/modules/auth';

/** Connect the request layer with the auth store */
export function setupRequest() {
  setupRequestHandlers({
    onUnauthorized: async () => {
      await useAuthStore().resetStore();
    },
  });
}
