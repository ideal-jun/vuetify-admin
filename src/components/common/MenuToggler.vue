<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'MenuToggler' });

const props = withDefaults(
  defineProps<{
    collapsed?: boolean;
    arrowIcon?: boolean;
    zIndex?: number;
  }>(),
  {
    collapsed: false,
    arrowIcon: false,
    zIndex: 98,
  },
);

const icon = computed(() => {
  if (props.arrowIcon) {
    return props.collapsed ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left';
  }

  return props.collapsed ? 'mdi-menu-open' : 'mdi-menu';
});

const tooltip = computed(() => (props.collapsed ? $t('icon.expand') : $t('icon.collapse')));
</script>

<template>
  <ButtonIcon :key="String(collapsed)" :tooltip-content="tooltip" :z-index="zIndex">
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>
