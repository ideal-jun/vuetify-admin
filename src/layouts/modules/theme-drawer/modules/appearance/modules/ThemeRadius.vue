<script setup lang="ts">
import SettingDivider from '@/layouts/modules/theme-drawer/components/SettingDivider.vue';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'ThemeRadius',
});

const themeStore = useThemeStore();
</script>

<template>
  <SettingDivider :title="$t('theme.appearance.themeRadius.title')"></SettingDivider>

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem key="1" :label="$t('theme.appearance.themeRadius.title')">
      <VNumberInput
        v-model="themeStore.themeRadius"
        control-variant="stacked"
        density="compact"
        hide-details
        :max="16"
        max-width="160"
        :min="0"
        min-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>
  </TransitionGroup>
</template>
