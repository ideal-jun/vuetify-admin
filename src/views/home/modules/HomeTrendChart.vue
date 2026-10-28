<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'HomeTrendChart' });

const { thisWeek, lastWeek } = defineProps<{
  thisWeek: number[];
  lastWeek: number[];
}>();

const width = 640;
const height = 240;
const padding = { top: 20, right: 16, bottom: 32, left: 36 };

const maxValue = computed(() => Math.max(1, ...thisWeek, ...lastWeek) + 10);

function pointsOf(values: number[]) {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const segmentCount = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = padding.left + (index / segmentCount) * innerWidth;
      const y = padding.top + innerHeight - (value / maxValue.value) * innerHeight;

      return `${x},${y}`;
    })
    .join(' ');
}

const thisWeekPoints = computed(() => pointsOf(thisWeek));
const lastWeekPoints = computed(() => pointsOf(lastWeek));

const areaPoints = computed(() => {
  const innerWidth = width - padding.left - padding.right;
  const bottom = height - padding.bottom;

  return `${padding.left},${bottom} ${thisWeekPoints.value} ${padding.left + innerWidth},${bottom}`;
});

const labels = computed(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, index) => {
    const x = padding.left + (index / (days.length - 1)) * (width - padding.left - padding.right);

    return { day, x };
  });
});

const gridLines = [0, 1, 2, 3].map((index) => {
  const innerHeight = height - padding.top - padding.bottom;

  return padding.top + (index / 3) * innerHeight;
});
</script>

<template>
  <VCard class="app-panel h-full" variant="flat">
    <VCardItem class="pb-2">
      <VCardTitle class="text-base font-600">{{ $t('page.home.trend.title') }}</VCardTitle>
      <VCardSubtitle class="text-xs">{{ $t('page.home.trend.subtitle') }}</VCardSubtitle>

      <template #append>
        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-primary" />
            {{ $t('page.home.trend.thisWeek') }}
          </span>
          <span class="flex items-center gap-1.5 opacity-60">
            <span class="size-2 rounded-full bg-primary/30" />
            {{ $t('page.home.trend.lastWeek') }}
          </span>
        </div>
      </template>
    </VCardItem>

    <VCardText class="pt-2">
      <svg class="w-full" preserveAspectRatio="none" :viewBox="`0 0 ${width} ${height}`">
        <defs>
          <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="rgb(var(--v-theme-primary))" stop-opacity="0.28" />
            <stop offset="100%" stop-color="rgb(var(--v-theme-primary))" stop-opacity="0" />
          </linearGradient>
        </defs>

        <line
          v-for="(line, index) in gridLines"
          :key="index"
          stroke="currentColor"
          stroke-dasharray="4 6"
          stroke-opacity="0.08"
          :x1="padding.left"
          :x2="width - padding.right"
          :y1="line"
          :y2="line"
        />

        <polygon fill="url(#trend-area)" :points="areaPoints" />

        <polyline
          fill="none"
          :points="lastWeekPoints"
          stroke="rgb(var(--v-theme-primary))"
          stroke-dasharray="5 5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-opacity="0.3"
          stroke-width="2"
        />

        <polyline
          fill="none"
          :points="thisWeekPoints"
          stroke="rgb(var(--v-theme-primary))"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
        />

        <text
          v-for="label in labels"
          :key="label.day"
          fill="currentColor"
          font-size="11"
          opacity="0.45"
          text-anchor="middle"
          :x="label.x"
          :y="height - 10"
        >
          {{ label.day }}
        </text>
      </svg>
    </VCardText>
  </VCard>
</template>
