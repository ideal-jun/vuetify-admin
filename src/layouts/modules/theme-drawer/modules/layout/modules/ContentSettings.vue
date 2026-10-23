<script setup lang="ts">
import AppSwitch from '@/components/common/AppSwitch.vue';
import IconTooltip from '@/components/common/IconTooltip.vue';
import { themePageAnimationModeOptions, themeScrollModeOptions } from '@/constants/app';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';
import { translateOptions } from '@/utils/common';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'ContentSettings',
});

const themeStore = useThemeStore();
</script>

<template>
  <SettingDivider :title="$t('theme.layout.content.title')" />

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem key="1" :label="$t('theme.layout.content.scrollMode.title')">
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.content.scrollMode.tip')" />
      </template>
      <VSelect
        v-model="themeStore.layout.scrollMode"
        density="compact"
        hide-details
        item-title="label"
        item-value="value"
        :items="translateOptions(themeScrollModeOptions)"
        max-width="160"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem key="2" :label="$t('theme.layout.content.page.animate')">
      <AppSwitch v-model="themeStore.page.animate" />
    </SettingItem>

    <SettingItem
      v-if="themeStore.page.animate"
      key="3"
      :label="$t('theme.layout.content.page.mode.title')"
    >
      <VSelect
        v-model="themeStore.page.animateMode"
        density="compact"
        hide-details
        item-title="label"
        item-value="value"
        :items="translateOptions(themePageAnimationModeOptions)"
        max-width="160"
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
