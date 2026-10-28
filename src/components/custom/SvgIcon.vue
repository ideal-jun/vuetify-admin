<script setup lang="ts">
import { computed } from 'vue';

import { normalizeIcon } from '@/utils/icon';

defineOptions({ name: 'SvgIcon', inheritAttrs: false });

const { icon, size } = defineProps<{
  /** The icon name, MDI or iconify style */
  icon?: string;
  /** The local svg icon name */
  localIcon?: string;
  /** The icon size */
  size?: string | number;
}>();

const iconName = computed(() => normalizeIcon(icon));
</script>

<template>
  <VIcon v-bind="$attrs" :icon="iconName" :size="size" />
</template>
