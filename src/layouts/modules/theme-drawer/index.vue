<script setup lang="ts">
import { computed, ref } from 'vue';

import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';

import AppearanceSettings from './modules/appearance/index.vue';
import ConfigOperation from './modules/ConfigOperation.vue';
import GeneralSettings from './modules/general/index.vue';
import LayoutSettings from './modules/layout/index.vue';
import PresetSettings from './modules/preset/index.vue';

defineOptions({
  name: 'ThemeDrawer',
});

const appStore = useAppStore();

const activeTab = ref('appearance');

const drawerWidth = computed(() => {
  const width = 400;

  // On mobile devices, use 90% of viewport width with a maximum of 400px
  if (appStore.isMobile) {
    return `min(90vw, ${width}px)`;
  }

  return width;
});

const tabs = computed(() => [
  { value: 'appearance', title: $t('theme.tabs.appearance') },
  { value: 'layout', title: $t('theme.tabs.layout') },
  { value: 'general', title: $t('theme.tabs.general') },
  { value: 'preset', title: $t('theme.tabs.preset') },
]);
</script>

<template>
  <VNavigationDrawer
    v-model="appStore.themeDrawerVisible"
    class="theme-drawer"
    location="right"
    order="-1"
    temporary
    :width="drawerWidth"
  >
    <template #prepend>
      <div class="flex items-center justify-between px-4 py-3">
        <h2 class="text-base text-base-text font-600">{{ $t('theme.themeDrawerTitle') }}</h2>

        <ButtonIcon :tooltip-content="$t('common.close')" @click="appStore.closeThemeDrawer">
          <SvgIcon icon="mdi-close" />
        </ButtonIcon>
      </div>

      <VTabs v-model="activeTab" class="shadow-none mx-4" density="compact" grow inset>
        <VTab
          v-for="tab in tabs"
          :key="tab.value"
          min-width="30"
          :ripple="false"
          :value="tab.value"
        >
          {{ tab.title }}
        </VTab>
      </VTabs>
    </template>

    <VTabsWindow v-model="activeTab" class="p-4">
      <VTabsWindowItem value="appearance">
        <AppearanceSettings />
      </VTabsWindowItem>
      <VTabsWindowItem value="layout">
        <LayoutSettings />
      </VTabsWindowItem>
      <VTabsWindowItem value="general">
        <GeneralSettings />
      </VTabsWindowItem>
      <VTabsWindowItem value="preset">
        <PresetSettings />
      </VTabsWindowItem>
    </VTabsWindow>

    <template #append>
      <VDivider></VDivider>
      <ConfigOperation />
    </template>
  </VNavigationDrawer>
</template>

<style scoped></style>
