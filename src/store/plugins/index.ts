import type { PiniaPluginContext } from 'pinia';

import { SetupStoreId } from '@/enum';
import { jsonClone } from '@/utils/common';

/**
 * The plugin resets the state of stores written with the setup syntax
 *
 * @param context
 */
export function resetSetupStore(context: PiniaPluginContext) {
  const setupSyntaxIds = Object.values(SetupStoreId) as string[];

  if (setupSyntaxIds.includes(context.store.$id)) {
    const { $state } = context.store;

    const defaultStore = jsonClone($state);

    context.store.$reset = () => {
      context.store.$patch(defaultStore);
    };
  }
}
