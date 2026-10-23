<script setup lang="ts">
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'GlobalSettings',
});

const themeStore = useThemeStore();
</script>

<template>
  <SettingDivider :title="$t('theme.general.title')" />

  <SettingItem :label="$t('theme.general.multilingual.visible')">
    <AppSwitch v-model="themeStore.header.multilingual.visible" />
  </SettingItem>

  <SettingItem :label="$t('theme.general.globalSearch.visible')">
    <AppSwitch v-model="themeStore.header.globalSearch.visible" />
  </SettingItem>
</template>
