<script setup lang="ts">
import { TransitionPresets, useTransition } from '@vueuse/core';
import { computed, nextTick, ref, watch } from 'vue';

defineOptions({ name: 'CountTo' });

const {
  startValue = 0,
  endValue = 2021,
  duration = 1500,
  autoplay = true,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  decimal = '.',
  useEasing = true,
  transition = 'easeOutExpo',
} = defineProps<{
  startValue?: number;
  endValue?: number;
  duration?: number;
  autoplay?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimal?: string;
  useEasing?: boolean;
  transition?: keyof typeof TransitionPresets;
}>();

const source = ref(startValue);

const transitionPreset = computed(() => (useEasing ? TransitionPresets[transition] : undefined));

const outputValue = useTransition(source, {
  duration,
  transition: transitionPreset.value,
});

const value = computed(() => {
  let number = outputValue.value.toFixed(decimals);

  const parts = number.split('.');
  let integer = parts[0] ?? '0';
  const decimalPart = parts.length > 1 ? decimal + parts[1] : '';

  const rgx = /(\d+)(\d{3})/;

  if (separator) {
    while (rgx.test(integer)) {
      integer = integer.replace(rgx, `$1${separator}$2`);
    }
  }

  number = integer + decimalPart;

  return prefix + number + suffix;
});

async function start() {
  await nextTick();
  source.value = endValue;
}

watch(
  [() => startValue, () => endValue],
  () => {
    if (autoplay) {
      void start();
    }
  },
  { immediate: true },
);
</script>

<template>
  <span>{{ value }}</span>
</template>
