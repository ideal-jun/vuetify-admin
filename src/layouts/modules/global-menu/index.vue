<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useRouteStore } from '@/store/modules/route';

import GlobalMenuItem from './components/GlobalMenuItem.vue';

defineOptions({ name: 'GlobalMenu' });

const props = withDefaults(
  defineProps<{
    /** The menu tree to render, defaults to the route store menus */
    items?: App.Global.Menu[];
    /** Render the menu as an icon rail */
    rail?: boolean;
    /** The maximum depth to render, 0 renders only the first level */
    maxDepth?: number;
    /** Use the compact list density */
    compact?: boolean;
  }>(),
  {
    items: undefined,
    rail: false,
    maxDepth: undefined,
    compact: false,
  },
);

const route = useRoute();
const routeStore = useRouteStore();

const menus = computed(() => props.items ?? routeStore.menus);

/** The rail only shows the first level, a deeper menu needs more horizontal space */
const effectiveMaxDepth = computed(() => (props.rail ? 0 : props.maxDepth));

const opened = ref<string[]>([]);

watch(
  () => route.name,
  () => {
    const keyPath = routeStore.getSelectedMenuKeyPath(String(route.name ?? ''));

    opened.value = keyPath.slice(0, -1);
  },
  { immediate: true },
);
</script>

<template>
  <VList
    v-model:opened="opened"
    class="app-menu"
    :class="{ 'app-menu--rail': rail }"
    color="primary"
    :density="rail || compact ? 'compact' : 'default'"
    nav
  >
    <GlobalMenuItem
      v-for="item in menus"
      :key="item.key"
      :depth="0"
      :item="item"
      :max-depth="effectiveMaxDepth"
    />
  </VList>
</template>

<style scoped>
.app-menu--rail :deep(.v-list-item) {
  justify-content: center;
  padding-inline: 0;
}

.app-menu--rail :deep(.v-list-item-title),
.app-menu--rail :deep(.v-list-group__header__append-icon) {
  display: none;
}
</style>
