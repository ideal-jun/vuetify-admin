<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { getFirstLeafPath, isMenuActive } from '../shared';

defineOptions({ name: 'GlobalMenuItem' });

const {
  item,
  depth = 0,
  maxDepth = undefined,
} = defineProps<{
  item: App.Global.Menu;
  depth?: number;
  maxDepth?: number;
}>();

const route = useRoute();

const canExpand = computed(() => {
  const hasChildren = Boolean(item.children?.length);
  const depthLimit = maxDepth ?? Number.POSITIVE_INFINITY;

  return hasChildren && depth < depthLimit;
});

const active = computed(() => isMenuActive(item, String(route.name ?? ''), route.meta.activeMenu));

const to = computed(() => getFirstLeafPath(item) ?? item.routePath);
</script>

<template>
  <VListGroup v-if="canExpand" :value="item.key">
    <template #activator="{ props: activatorProps }">
      <VListItem
        v-bind="activatorProps"
        :active="active"
        :aria-label="item.label"
        class="app-menu-item"
        :prepend-icon="item.icon"
        rounded="lg"
        :title="item.label"
      />
    </template>

    <GlobalMenuItem
      v-for="child in item.children"
      :key="child.key"
      :depth="depth + 1"
      :item="child"
      :max-depth="maxDepth"
    />
  </VListGroup>

  <VListItem
    v-else
    :active="active"
    :aria-label="item.label"
    class="app-menu-item"
    :prepend-icon="item.icon"
    rounded="lg"
    :title="item.label"
    :to="to"
  />
</template>
