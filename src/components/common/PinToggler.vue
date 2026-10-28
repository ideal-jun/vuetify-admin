<script setup lang="ts">
import { computed } from 'vue';

import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';

defineOptions({ name: 'PinToggler' });

const { pin } = defineProps<{
  pin?: boolean;
}>();

const icon = computed(() => (pin ? 'mdi-pin-off' : 'mdi-pin'));
</script>

<template>
  <ButtonIcon :tooltip-content="pin ? $t('icon.unpin') : $t('icon.pin')" :z-index="100">
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>
