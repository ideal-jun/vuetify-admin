<script setup lang="ts">
import AppSwitch from '@/components/common/AppSwitch.vue';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'HeaderSettings',
});

const themeStore = useThemeStore();
</script>

<template>
  <SettingDivider :title="$t('theme.layout.header.title')" />

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem key="1" :label="$t('theme.layout.header.height')">
      <VNumberInput
        v-model="themeStore.header.height"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem key="2" :label="$t('theme.layout.header.breadcrumb.visible')">
      <AppSwitch v-model="themeStore.header.breadcrumb.visible" />
    </SettingItem>

    <SettingItem
      v-if="themeStore.header.breadcrumb.visible"
      key="3"
      :label="$t('theme.layout.header.breadcrumb.showIcon')"
    >
      <AppSwitch v-model="themeStore.header.breadcrumb.showIcon" />
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
