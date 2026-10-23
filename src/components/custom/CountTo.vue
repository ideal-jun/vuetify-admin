<script setup lang="ts">
import { TransitionPresets, useTransition } from '@vueuse/core';
import { computed, nextTick, ref, watch } from 'vue';

defineOptions({ name: 'CountTo' });

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    startValue: 0,
    endValue: 2021,
    duration: 1500,
    autoplay: true,
    decimals: 0,
    prefix: '',
    suffix: '',
    separator: ',',
    decimal: '.',
    useEasing: true,
    transition: 'easeOutExpo',
  },
);

const source = ref(props.startValue);

const transition = computed(() =>
  props.useEasing ? TransitionPresets[props.transition] : undefined,
);

const outputValue = useTransition(source, {
  duration: props.duration,
  transition: transition.value,
});

const value = computed(() => {
  let number = outputValue.value.toFixed(props.decimals);

  const parts = number.split('.');
  let integer = parts[0] ?? '0';
  const decimalPart = parts.length > 1 ? props.decimal + parts[1] : '';

  const rgx = /(\d+)(\d{3})/;

  if (props.separator) {
    while (rgx.test(integer)) {
      integer = integer.replace(rgx, `$1${props.separator}$2`);
    }
  }

  number = integer + decimalPart;

  return props.prefix + number + props.suffix;
});

async function start() {
  await nextTick();
  source.value = props.endValue;
}

watch(
  [() => props.startValue, () => props.endValue],
  () => {
    if (props.autoplay) {
      void start();
    }
  },
  { immediate: true },
);
</script>

<template>
  <span>{{ value }}</span>
</template>
