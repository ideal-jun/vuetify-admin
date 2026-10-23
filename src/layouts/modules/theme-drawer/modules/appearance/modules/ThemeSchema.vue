<script setup lang="ts">
import { computed } from 'vue';

import AppSwitch from '@/components/common/AppSwitch.vue';
import { themeSchemaRecord } from '@/constants/app';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'ThemeSchema',
});

const themeStore = useThemeStore();

const icons: Record<UnionKey.ThemeScheme, string> = {
  light: 'mdi-weather-sunny',
  dark: 'mdi-weather-night',
  auto: 'mdi-theme-light-dark',
};

function handleGrayscaleChange(value: boolean) {
  themeStore.setGrayscale(value);
}

function handleColourWeaknessChange(value: boolean) {
  themeStore.setColourWeakness(value);
}

const showSiderInverted = computed(
  () => !themeStore.darkMode && themeStore.layout.mode.includes('vertical'),
);
</script>

<template>
  <SettingDivider :title="$t('theme.appearance.themeSchema.title')" />

  <div class="flex-col-stretch gap-16px">
    <div class="i-flex-center">
      <VTabs v-model="themeStore.themeScheme" class="shadow-none mx-8" density="compact" grow inset>
        <VTab
          v-for="(_, key) in themeSchemaRecord"
          :key="key"
          min-width="30"
          :ripple="false"
          :value="key"
        >
          <VIcon :icon="icons[key]"></VIcon>
        </VTab>
      </VTabs>
    </div>

    <Transition name="sider-inverted">
      <SettingItem v-if="showSiderInverted" :label="$t('theme.layout.sider.inverted')">
        <AppSwitch v-model="themeStore.sider.inverted" />
      </SettingItem>
    </Transition>

    <SettingItem :label="$t('theme.appearance.grayscale')">
      <AppSwitch :model-value="themeStore.grayscale" @update:model-value="handleGrayscaleChange" />
    </SettingItem>

    <SettingItem :label="$t('theme.appearance.colourWeakness')">
      <AppSwitch
        :model-value="themeStore.colourWeakness"
        @update:model-value="handleColourWeaknessChange"
      />
    </SettingItem>
  </div>
</template>

<style scoped>
.sider-inverted-enter-active,
.sider-inverted-leave-active {
  height: 22px;
  transition: all 0.2s;
}

.sider-inverted-enter-from,
.sider-inverted-leave-to {
  height: 0;
  opacity: 0;
  transform: translateX(20px);
}
</style>
