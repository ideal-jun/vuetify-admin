<script setup lang="ts">
import AppSwitch from '@/components/common/AppSwitch.vue';
import IconTooltip from '@/components/common/IconTooltip.vue';
import { themeColorSwatches } from '@/constants/app';
import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

import SettingDivider from '../../../components/SettingDivider.vue';
import SettingItem from '../../../components/SettingItem.vue';

defineOptions({
  name: 'ThemeColor',
});

const themeStore = useThemeStore();

function handleUpdateColor(color: string | null, key: App.Theme.ThemeColorKey) {
  if (color) {
    themeStore.updateThemeColors(key, color);
  }
}

function handleFollowPrimary(value: boolean | null) {
  themeStore.isInfoFollowPrimary = Boolean(value);
}

const swatches: string[] = themeColorSwatches;
</script>

<template>
  <SettingDivider :title="$t('theme.appearance.themeColor.title')" />
  <div class="flex-col-stretch gap-12px">
    <SettingItem key="recommend-color" :label="$t('theme.appearance.recommendColor')">
      <template #suffix>
        <IconTooltip>
          <p>
            <span class="pr-12px">{{ $t('theme.appearance.recommendColorDesc') }}</span>
            <br />
            <a
              class="text-gray-500"
              href="https://uicolors.app/create"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://uicolors.app/create
            </a>
          </p>
        </IconTooltip>
      </template>

      <AppSwitch v-model="themeStore.recommendColor" />
    </SettingItem>

    <SettingItem
      v-for="(_, key) in themeStore.themeColors"
      :key="key"
      :label="$t(`theme.appearance.themeColor.${key}` as App.I18n.I18nKey)"
    >
      <template v-if="key === 'info'" #suffix>
        <VCheckbox
          color="primary"
          density="compact"
          hide-details
          :label="$t('theme.appearance.themeColor.followPrimary')"
          :model-value="themeStore.isInfoFollowPrimary"
          @update:model-value="handleFollowPrimary"
        />
      </template>

      <VColorInput
        :base-color="themeStore.themeColors[key]"
        :color="themeStore.themeColors[key]"
        color-pip
        density="compact"
        :disabled="key === 'info' && themeStore.isInfoFollowPrimary"
        hide-actions
        hide-details
        max-width="160"
        :menu-props="{ zIndex: 4000 }"
        :model-value="themeStore.themeColors[key]"
        :modes="['hex']"
        open-on-focus
        pip-location="prepend-inner"
        :swatches="[swatches]"
        variant="outlined"
        @update:model-value="handleUpdateColor($event, key)"
      />
    </SettingItem>
  </div>
</template>

<style scoped></style>
