<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'ThemeSchemaSwitch' });

const props = withDefaults(
  defineProps<{
    /** Theme scheme */
    themeSchema: UnionKey.ThemeScheme;
    /** Show tooltip */
    showTooltip?: boolean;
  }>(),
  {
    showTooltip: true,
  },
);

const emit = defineEmits<{
  (e: 'switch'): void;
}>();

const icons: Record<UnionKey.ThemeScheme, string> = {
  light: 'mdi-weather-sunny',
  dark: 'mdi-weather-night',
  auto: 'mdi-theme-light-dark',
};

const icon = computed(() => icons[props.themeSchema]);

const tooltipContent = computed(() => (props.showTooltip ? $t('icon.themeSchema') : ''));
</script>

<template>
  <ButtonIcon :icon="icon" :tooltip-content="tooltipContent" @click="emit('switch')" />
</template>
