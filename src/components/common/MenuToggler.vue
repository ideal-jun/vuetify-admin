<script setup lang="ts">
import { computed } from 'vue';

import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';

defineOptions({ name: 'MenuToggler' });

const {
  collapsed = false,
  arrowIcon = false,
  zIndex = 98,
} = defineProps<{
  collapsed?: boolean;
  arrowIcon?: boolean;
  zIndex?: number;
}>();

const icon = computed(() => {
  if (arrowIcon) {
    return collapsed ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left';
  }

  return collapsed ? 'mdi-menu-open' : 'mdi-menu';
});

const tooltip = computed(() => (collapsed ? $t('icon.expand') : $t('icon.collapse')));
</script>

<template>
  <ButtonIcon :key="String(collapsed)" :tooltip-content="tooltip" :z-index="zIndex">
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>
