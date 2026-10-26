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

function railChange(bool) {
  console.log('---------------------------', bool);
}
</script>

<template>
  <VList
    v-model:opened="opened"
    color="primary"
    density="compact"
    :indent="32"
    nav
    :prepend-gap="12"
    @update:expanded="railChange"
  >
    <GlobalMenuItem v-for="item in menus" :key="item.key" :depth="0" :item="item" />
  </VList>
</template>

<style scoped></style>
