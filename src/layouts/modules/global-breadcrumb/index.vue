<script setup lang="ts">
import { useRouteStore } from '@/store/modules/route';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({ name: 'GlobalBreadcrumb' });

const themeStore = useThemeStore();
const routeStore = useRouteStore();
</script>

<template>
  <VBreadcrumbs
    v-if="themeStore.header.breadcrumb.visible"
    class="app-breadcrumb ml-2"
    density="compact"
  >
    <VBreadcrumbsItem
      v-for="(item, index) in routeStore.breadcrumbs"
      :key="item.key"
      :disabled="index === routeStore.breadcrumbs.length - 1"
    >
      <VIcon
        v-if="themeStore.header.breadcrumb.showIcon && item.icon"
        class="mr-1"
        :icon="item.icon"
        size="16"
      />
      {{ item.label }}
    </VBreadcrumbsItem>
  </VBreadcrumbs>
</template>

<style scoped>
.app-breadcrumb :deep(.v-breadcrumbs-item--disabled) {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>
