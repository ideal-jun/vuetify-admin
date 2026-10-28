<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import { getFirstLeafPath, isMenuActive } from '../shared';
import GlobalMenuItem from './GlobalMenuItem.vue';

defineOptions({ name: 'GlobalMenuHorizontal' });

const { items } = defineProps<{
  items: App.Global.Menu[];
}>();

const route = useRoute();
const router = useRouter();

function activeOf(item: App.Global.Menu) {
  return isMenuActive(item, String(route.name ?? ''), route.meta.activeMenu);
}

function navigate(item: App.Global.Menu) {
  void router.push(getFirstLeafPath(item));
}
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto py-1">
    <template v-for="item in items" :key="item.key">
      <VMenu v-if="item.children?.length" location="bottom start" open-on-hover>
        <template #activator="{ props: activatorProps }">
          <VBtn
            v-bind="activatorProps"
            :active="activeOf(item)"
            class="text-none"
            :prepend-icon="item.icon"
            variant="text"
            @click="navigate(item)"
          >
            {{ item.label }}
          </VBtn>
        </template>

        <VList density="compact" min-width="200" nav>
          <GlobalMenuItem
            v-for="child in item.children"
            :key="child.key"
            :depth="0"
            :item="child"
          />
        </VList>
      </VMenu>

      <VBtn
        v-else
        :active="activeOf(item)"
        class="text-none"
        :prepend-icon="item.icon"
        :to="item.routePath"
        variant="text"
      >
        {{ item.label }}
      </VBtn>
    </template>
  </div>
</template>
