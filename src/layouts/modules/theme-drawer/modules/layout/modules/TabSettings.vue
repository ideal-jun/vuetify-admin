<script setup lang="ts">
import AppSwitch from '@/components/common/AppSwitch.vue';
import IconTooltip from '@/components/common/IconTooltip.vue';
import { themeTabModeOptions } from '@/constants/app';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';
import { translateOptions } from '@/utils/common';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'TabSettings',
});

const themeStore = useThemeStore();
</script>

<template>
  <SettingDivider :title="$t('theme.layout.tab.title')" />

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem key="1" :label="$t('theme.layout.tab.visible')">
      <AppSwitch v-model="themeStore.tab.visible" />
    </SettingItem>

    <SettingItem v-if="themeStore.tab.visible" key="2" :label="$t('theme.layout.tab.cache')">
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.tab.cacheTip')" />
      </template>
      <AppSwitch v-model="themeStore.tab.cache" />
    </SettingItem>

    <SettingItem v-if="themeStore.tab.visible" key="3" :label="$t('theme.layout.tab.height')">
      <VNumberInput
        v-model="themeStore.tab.height"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem v-if="themeStore.tab.visible" key="4" :label="$t('theme.layout.tab.mode.title')">
      <VSelect
        v-model="themeStore.tab.mode"
        density="compact"
        hide-details
        item-title="label"
        item-value="value"
        :items="translateOptions(themeTabModeOptions)"
        max-width="160"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem
      v-if="themeStore.tab.visible"
      key="5"
      :label="$t('theme.layout.tab.closeByMiddleClick')"
    >
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.tab.closeByMiddleClickTip')" />
      </template>
      <AppSwitch v-model="themeStore.tab.closeTabByMiddleClick" />
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
