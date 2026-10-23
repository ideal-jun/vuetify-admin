<script setup lang="ts">
defineOptions({ name: 'ButtonIcon', inheritAttrs: false });

withDefaults(
  defineProps<{
    icon?: string;
    tooltipContent?: string;
    tooltipPlacement?: 'top' | 'bottom' | 'start' | 'end' | 'bottom start' | 'top start';
    zIndex?: number;
    size?: string | number;
  }>(),
  {
    icon: '',
    tooltipContent: '',
    tooltipPlacement: 'bottom',
    zIndex: 98,
    size: 'default',
  },
);
</script>

<template>
  <VTooltip :disabled="!tooltipContent" :location="tooltipPlacement" :z-index="zIndex">
    <template #activator="{ props: activatorProps }">
      <VBtn v-bind="{ ...$attrs, ...activatorProps }" icon :size="size" variant="text">
        <slot>
          <SvgIcon :icon="icon" />
        </slot>
      </VBtn>
    </template>

    <span>{{ tooltipContent }}</span>
  </VTooltip>
</template>
