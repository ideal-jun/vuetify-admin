<script setup lang="ts">
import { computed } from 'vue';

import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import { $t } from '@/locales';

defineOptions({ name: 'ThemeSchemaSwitch' });

const { themeSchema, showTooltip = true } = defineProps<{
  /** Theme scheme */
  themeSchema: UnionKey.ThemeScheme;
  /** Show tooltip */
  showTooltip?: boolean;
}>();

const emit = defineEmits<{
  (e: 'switch'): void;
}>();

const icons: Record<UnionKey.ThemeScheme, string> = {
  light: 'mdi-weather-sunny',
  dark: 'mdi-weather-night',
  auto: 'mdi-theme-light-dark',
};

const icon = computed(() => icons[themeSchema]);

const tooltipContent = computed(() => (showTooltip ? $t('icon.themeSchema') : ''));
</script>

<template>
  <ButtonIcon :icon="icon" :tooltip-content="tooltipContent" @click="emit('switch')" />
</template>
