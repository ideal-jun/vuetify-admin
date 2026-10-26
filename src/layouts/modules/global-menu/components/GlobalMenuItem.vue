<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { getFirstLeafPath, isMenuActive } from '../shared';

defineOptions({ name: 'GlobalMenuItem' });

const props = withDefaults(
  defineProps<{
    item: App.Global.Menu;
    depth?: number;
    maxDepth?: number;
  }>(),
  {
    depth: 0,
    maxDepth: undefined,
  },
);

const route = useRoute();

const canExpand = computed(() => {
  const hasChildren = Boolean(props.item.children?.length);
  const maxDepth = props.maxDepth ?? Number.POSITIVE_INFINITY;

  return hasChildren && props.depth < maxDepth;
});

const active = computed(() =>
  isMenuActive(props.item, String(route.name ?? ''), route.meta.activeMenu),
);

const to = computed(() => getFirstLeafPath(props.item) ?? props.item.routePath);
</script>

<template>
  <VListGroup v-if="canExpand" :value="item.key">
    <template #activator="{ props: activatorProps }">
      <VListItem
        v-bind="activatorProps"
        :active="active"
        :aria-label="item.label"
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
    :prepend-icon="item.icon"
    rounded="lg"
    :title="item.label"
    :to="to"
  />
</template>
