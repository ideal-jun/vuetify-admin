<script setup lang="ts">
import { computed } from 'vue';

import { watermarkTimeFormatOptions } from '@/constants/app';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'WatermarkSettings',
});

const themeStore = useThemeStore();

const isWatermarkTextVisible = computed(
  () =>
    themeStore.watermark.visible &&
    !themeStore.watermark.enableUserName &&
    !themeStore.watermark.enableTime,
);
</script>

<template>
  <SettingDivider :title="$t('theme.general.watermark.title')" />

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem key="1" :label="$t('theme.general.watermark.visible')">
      <AppSwitch v-model="themeStore.watermark.visible" />
    </SettingItem>

    <SettingItem
      v-if="themeStore.watermark.visible"
      key="2"
      :label="$t('theme.general.watermark.enableUserName')"
    >
      <AppSwitch
        :model-value="themeStore.watermark.enableUserName"
        @update:model-value="themeStore.setWatermarkEnableUserName"
      />
    </SettingItem>

    <SettingItem
      v-if="themeStore.watermark.visible"
      key="3"
      :label="$t('theme.general.watermark.enableTime')"
    >
      <AppSwitch
        :model-value="themeStore.watermark.enableTime"
        @update:model-value="themeStore.setWatermarkEnableTime"
      />
    </SettingItem>

    <SettingItem
      v-if="themeStore.watermark.visible && themeStore.watermark.enableTime"
      key="4"
      :label="$t('theme.general.watermark.timeFormat')"
    >
      <VSelect
        v-model="themeStore.watermark.timeFormat"
        class="w-210px"
        density="compact"
        hide-details
        item-title="label"
        item-value="value"
        :items="watermarkTimeFormatOptions"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem v-if="isWatermarkTextVisible" key="5" :label="$t('theme.general.watermark.text')">
      <VTextField
        v-model="themeStore.watermark.text"
        class="w-120px"
        density="compact"
        hide-details
        placeholder="SoybeanAdmin"
        variant="outlined"
      />
    </SettingItem>
  </TransitionGroup>
</template>

<style scoped>
.setting-list-move,
.setting-list-enter-active,
.setting-list-leave-active {
  transition: all 0.3s;
}

.setting-list-enter-from,
.setting-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.setting-list-leave-active {
  position: absolute;
}
</style>
