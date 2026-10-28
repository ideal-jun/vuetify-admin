<script setup lang="ts">
import { computed } from 'vue';

import { useAppStore } from '@/store/modules/app';
import { useRouteStore } from '@/store/modules/route';
import { useTabStore } from '@/store/modules/tab';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({ name: 'GlobalContent' });

const { showPadding = true } = defineProps<{
  /** Whether to add padding to the content */
  showPadding?: boolean;
}>();

const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();
const tabStore = useTabStore();

const transitionName = computed(() => (themeStore.page.animate ? themeStore.page.animateMode : ''));

function getTabId(route: Parameters<typeof tabStore.getTabIdByRoute>[0]) {
  return tabStore.getTabIdByRoute(route);
}
</script>

<template>
  <VContainer class="h-full" :class="{ 'p-0': !showPadding }" fluid>
    <RouterView v-slot="{ Component, route }">
      <Transition mode="out-in" :name="transitionName">
        <KeepAlive :exclude="routeStore.excludeCacheRoutes" :include="routeStore.cacheRoutes">
          <component
            :is="Component"
            v-if="appStore.reloadFlag"
            :key="getTabId(route)"
            class="min-h-full"
          />
        </KeepAlive>
      </Transition>
    </RouterView>
  </VContainer>
</template>
