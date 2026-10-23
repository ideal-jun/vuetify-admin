<script setup lang="ts">
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

import LayoutModeCard from '../../../components/LayoutModeCard.vue';
import SettingDivider from '../../../components/SettingDivider.vue';

defineOptions({
  name: 'LayoutMode',
});

const appStore = useAppStore();
const themeStore = useThemeStore();
</script>

<template>
  <SettingDivider :title="$t('theme.layout.layoutMode.title')" />

  <LayoutModeCard v-model:mode="themeStore.layout.mode" :disabled="appStore.isMobile">
    <template #vertical>
      <div class="layout-sider h-full w-18px !bg-primary"></div>
      <div class="vertical-wrapper">
        <div class="layout-header bg-primary-200"></div>
        <div class="layout-main"></div>
      </div>
    </template>

    <template #vertical-mix>
      <div class="layout-sider h-full w-8px !bg-primary"></div>
      <div class="layout-sider h-full w-16px !bg-primary-300"></div>
      <div class="vertical-wrapper">
        <div class="layout-header bg-primary-200"></div>
        <div class="layout-main"></div>
      </div>
    </template>

    <template #vertical-hybrid-header-first>
      <div class="layout-sider h-full w-8px !bg-primary"></div>
      <div class="layout-sider h-full w-16px !bg-primary-300"></div>
      <div class="vertical-wrapper">
        <div class="layout-header bg-primary"></div>
        <div class="layout-main"></div>
      </div>
    </template>

    <template #horizontal>
      <div class="layout-header !bg-primary"></div>
      <div class="horizontal-wrapper">
        <div class="layout-main"></div>
      </div>
    </template>

    <template #top-hybrid-sidebar-first>
      <div class="layout-header !bg-primary-300"></div>
      <div class="horizontal-wrapper">
        <div class="layout-sider w-18px !bg-primary"></div>
        <div class="layout-main"></div>
      </div>
    </template>

    <template #top-hybrid-header-first>
      <div class="layout-header bg-primary"></div>
      <div class="horizontal-wrapper">
        <div class="layout-sider w-18px"></div>
        <div class="layout-main"></div>
      </div>
    </template>
  </LayoutModeCard>
</template>

<style scoped>
.layout-header {
  height: 16px;
  border-radius: 4px;
}

.layout-sider {
  border-radius: 4px;
  background: rgb(var(--primary-300-color));
}

.layout-main {
  flex: 1;
  border-radius: 4px;
  background: rgb(var(--primary-200-color));
}

.vertical-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.horizontal-wrapper {
  flex: 1;
  display: flex;
  gap: 6px;
}
</style>
