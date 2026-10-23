<script setup lang="ts">
import { computed } from 'vue';

import AppSwitch from '@/components/common/AppSwitch.vue';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'FooterSettings',
});

const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);

const isMixHorizontalMode = computed(() =>
  ['top-hybrid-sidebar-first', 'top-hybrid-header-first'].includes(layoutMode.value),
);
</script>

<template>
  <SettingDivider :title="$t('theme.layout.footer.title')" />

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem key="1" :label="$t('theme.layout.footer.visible')">
      <AppSwitch v-model="themeStore.footer.visible" />
    </SettingItem>

    <SettingItem v-if="themeStore.footer.visible" key="3" :label="$t('theme.layout.footer.height')">
      <VNumberInput
        v-model="themeStore.footer.height"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem
      v-if="themeStore.footer.visible && isMixHorizontalMode"
      key="4"
      :label="$t('theme.layout.footer.right')"
    >
      <AppSwitch v-model="themeStore.footer.right" />
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
