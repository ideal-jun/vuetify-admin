<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'PinToggler' });

const props = defineProps<{
  pin?: boolean;
}>();

const icon = computed(() => (props.pin ? 'mdi-pin-off' : 'mdi-pin'));
</script>

<template>
  <ButtonIcon :tooltip-content="pin ? $t('icon.unpin') : $t('icon.pin')" :z-index="100">
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>
