<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'SiderSettings',
});

const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);

const isRegularSiderMode = computed(
  () => layoutMode.value === 'vertical' || layoutMode.value === 'vertical-hybrid-header-first',
);

const isMixLayoutMode = computed(
  () => layoutMode.value.includes('mix') || layoutMode.value.includes('hybrid'),
);

const isTopHybrid = computed(() => layoutMode.value.startsWith('top-hybrid'));
</script>

<template>
  <SettingDivider :title="$t('theme.layout.sider.title')" />

  <TransitionGroup class="flex-col-stretch gap-12px" name="setting-list" tag="div">
    <SettingItem v-if="isRegularSiderMode" key="1" :label="$t('theme.layout.sider.width')">
      <VNumberInput
        v-model="themeStore.sider.width"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem v-if="isRegularSiderMode" key="2" :label="$t('theme.layout.sider.collapsedWidth')">
      <VNumberInput
        v-model="themeStore.sider.collapsedWidth"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem
      v-if="layoutMode === 'vertical-mix'"
      key="3"
      :label="$t('theme.layout.sider.mixWidth')"
    >
      <VNumberInput
        v-model="themeStore.sider.mixWidth"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem v-if="isMixLayoutMode" key="4" :label="$t('theme.layout.sider.mixCollapsedWidth')">
      <VNumberInput
        v-model="themeStore.sider.mixCollapsedWidth"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
        variant="outlined"
      />
    </SettingItem>

    <SettingItem
      v-if="layoutMode === 'vertical-mix' || isTopHybrid"
      key="5"
      :label="$t('theme.layout.sider.mixChildMenuWidth')"
    >
      <VNumberInput
        v-model="themeStore.sider.mixChildMenuWidth"
        control-variant="stacked"
        density="compact"
        hide-details
        max-width="160"
        :step="1"
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
