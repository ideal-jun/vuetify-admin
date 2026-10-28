<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'HomeSourceChart' });

const { sources, total } = defineProps<{
  sources: Api.Home.Sources;
  total: number;
}>();

const sourceConfig = computed<{ key: Api.Home.SourceKey; label: string; color: string }[]>(() => [
  {
    key: 'direct',
    label: $t('page.home.source.direct'),
    color: 'rgb(var(--v-theme-primary))',
  },
  {
    key: 'search',
    label: $t('page.home.source.search'),
    color: 'rgb(var(--v-theme-info))',
  },
  {
    key: 'social',
    label: $t('page.home.source.social'),
    color: 'rgb(var(--v-theme-warning))',
  },
  {
    key: 'referral',
    label: $t('page.home.source.referral'),
    color: 'rgb(var(--v-theme-success))',
  },
]);

const data = computed(() =>
  sourceConfig.value.map((item) => ({
    ...item,
    value: sources[item.key],
  })),
);

const totalLabel = computed(() =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
    .format(total)
    .toLowerCase(),
);

const radius = 62;
const circumference = 2 * Math.PI * radius;
const center = 90;

const segments = computed(() => {
  let offset = 0;

  return data.value.map((item) => {
    const length = (item.value / 100) * circumference;
    const segment = {
      ...item,
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -offset,
    };

    offset += length;

    return segment;
  });
});
</script>

<template>
  <VCard class="app-panel h-full" variant="flat">
    <VCardItem class="pb-2">
      <VCardTitle class="text-base font-600">{{ $t('page.home.source.title') }}</VCardTitle>
      <VCardSubtitle class="text-xs">{{ $t('page.home.source.subtitle') }}</VCardSubtitle>
    </VCardItem>

    <VCardText class="flex flex-col items-center gap-5 pt-2">
      <div class="relative">
        <svg class="size-[180px] -rotate-90" :viewBox="`0 0 ${center * 2} ${center * 2}`">
          <circle
            :cx="center"
            :cy="center"
            fill="none"
            :r="radius"
            stroke="currentColor"
            stroke-opacity="0.06"
            stroke-width="18"
          />

          <circle
            v-for="segment in segments"
            :key="segment.key"
            :cx="center"
            :cy="center"
            fill="none"
            :r="radius"
            :stroke="segment.color"
            :stroke-dasharray="segment.dasharray"
            :stroke-dashoffset="segment.dashoffset"
            stroke-linecap="butt"
            stroke-width="18"
          />
        </svg>

        <div class="absolute-center text-center">
          <div class="text-2xl font-800">{{ totalLabel }}</div>
          <div class="text-[11px] opacity-50">{{ $t('page.home.stats.users') }}</div>
        </div>
      </div>

      <div class="grid w-full grid-cols-2 gap-2">
        <div
          v-for="item in data"
          :key="item.key"
          class="flex items-center gap-2 rounded-xl bg-black/2 px-2.5 py-2 dark:bg-white/5"
        >
          <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" />
          <span class="flex-1 truncate text-xs opacity-70">{{ item.label }}</span>
          <span class="text-xs font-700">{{ item.value }}%</span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
