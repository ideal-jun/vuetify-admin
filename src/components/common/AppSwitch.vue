<script setup lang="ts">
/* eslint-disable vue/custom-event-name-casing */
defineOptions({ name: 'AppSwitch' });

defineProps<{
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <VSwitch
    color="primary"
    density="compact"
    :disabled="disabled"
    hide-details
    :label="label"
    :model-value="Boolean(modelValue)"
    @update:model-value="(value) => emit('update:modelValue', Boolean(value))"
  />
</template>
