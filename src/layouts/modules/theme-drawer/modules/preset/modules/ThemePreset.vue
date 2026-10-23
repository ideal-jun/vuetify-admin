<script setup lang="ts">
import { defu } from 'defu';
import { computed } from 'vue';

import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';
import { themeSettings } from '@/theme/settings';

import SettingDivider from '../../../components/SettingDivider.vue';

defineOptions({
  name: 'ThemePreset',
});

type ThemePreset = Pick<
  App.Theme.ThemeSetting,
  | 'themeScheme'
  | 'grayscale'
  | 'colourWeakness'
  | 'recommendColor'
  | 'themeColor'
  | 'themeRadius'
  | 'otherColor'
  | 'isInfoFollowPrimary'
  | 'layout'
  | 'page'
  | 'header'
  | 'tab'
  | 'sider'
  | 'footer'
  | 'watermark'
  | 'tokens'
> & {
  name: string;
  desc: string;
  i18nkey?: string;
  version: string;
};

const presetModules = import.meta.glob('/src/theme/preset/*.json', {
  eager: true,
  import: 'default',
});

const themeStore = useThemeStore();

const presets = computed(() =>
  Object.entries(presetModules)
    .map(([path, presetData]) => {
      const fileName = path.split('/').pop()?.replace('.json', '') || '';

      return {
        id: fileName,
        ...(presetData as ThemePreset),
      };
    })
    .toSorted((a, b) => {
      if (a.id === 'default') {
        return -1;
      }

      if (b.id === 'default') {
        return 1;
      }

      return a.name.localeCompare(b.name);
    }),
);

function getPresetName(preset: ThemePreset) {
  if (!preset.i18nkey) {
    return preset.name;
  }

  try {
    const key = `${preset.i18nkey}.name` as App.I18n.I18nKey;
    const translated = $t(key);

    return translated === key ? preset.name : translated;
  } catch {
    return preset.name;
  }
}

function getPresetDesc(preset: ThemePreset) {
  if (!preset.i18nkey) {
    return preset.desc;
  }

  try {
    const key = `${preset.i18nkey}.desc` as App.I18n.I18nKey;
    const translated = $t(key);

    return translated === key ? preset.desc : translated;
  } catch {
    return preset.desc;
  }
}

function applyPreset(preset: ThemePreset & { id: string }) {
  const mergedPreset = defu(preset, themeSettings);

  const {
    id: _id,
    name: _name,
    desc: _desc,
    i18nkey: _i18nkey,
    version: _version,
    ...settings
  } = mergedPreset;

  themeStore.applySettings(settings);

  window.$message?.success($t('theme.appearance.preset.applySuccess'));
}
</script>

<template>
  <SettingDivider :title="$t('theme.appearance.preset.title')" />

  <div class="flex flex-col gap-3">
    <div
      v-for="preset in presets"
      :key="preset.id"
      class="border border-primary/10 rounded-lg border-solid bg-white/5 p-3 backdrop-blur-[10px] transition-all duration-300 hover:(shadow-md -translate-y-0.5)"
    >
      <div class="mb-2 flex items-center justify-between">
        <div class="min-w-0 w-full flex flex-1 items-center justify-between gap-2">
          <h5 class="m-0 truncate text-sm text-primary font-600">
            {{ getPresetName(preset) }}
          </h5>
          <VChip class="flex-shrink-0 opacity-80" color="info" size="x-small" variant="tonal">
            v{{ preset.version }}
          </VChip>
        </div>

        <VBtn
          class="ml-2 flex-shrink-0"
          color="primary"
          rounded="pill"
          size="x-small"
          variant="outlined"
          @click="applyPreset(preset)"
        >
          {{ $t('theme.appearance.preset.apply') }}
        </VBtn>
      </div>

      <p class="line-clamp-2 mb-3 text-xs text-gray-500 leading-4">{{ getPresetDesc(preset) }}</p>

      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <div
            v-for="(color, key) in { primary: preset.themeColor, ...preset.otherColor }"
            :key="key"
            class="h-3 w-3 cursor-pointer border border-white/30 rounded-full transition-transform hover:scale-110"
            :class="{ 'ring-1 ring-primary/50': key === 'primary' }"
            :style="{ backgroundColor: color }"
            :title="key"
          />
        </div>

        <div class="flex items-center gap-1">
          <div class="text-lg">
            {{ preset.themeScheme === 'dark' ? '🌙' : '☀️' }}
          </div>
          <div class="text-lg">
            {{ preset.grayscale ? '🎨' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
