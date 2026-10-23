<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'HomeRecentActivity' });

const activities = computed(() => [
  {
    key: 'item1',
    title: $t('page.home.recent.item1'),
    time: $t('page.home.recent.time1'),
    icon: 'mdi-creation',
    color: 'primary',
    dotClass: 'bg-primary',
    iconClass: 'text-primary',
  },
  {
    key: 'item2',
    title: $t('page.home.recent.item2'),
    time: $t('page.home.recent.time2'),
    icon: 'mdi-menu',
    color: 'info',
    dotClass: 'bg-info',
    iconClass: 'text-info',
  },
  {
    key: 'item3',
    title: $t('page.home.recent.item3'),
    time: $t('page.home.recent.time3'),
    icon: 'mdi-account-plus-outline',
    color: 'success',
    dotClass: 'bg-success',
    iconClass: 'text-success',
  },
]);
</script>

<template>
  <VCard class="app-panel h-full" variant="flat">
    <VCardItem class="pb-2">
      <VCardTitle class="text-base font-600">{{ $t('page.home.recent.title') }}</VCardTitle>
    </VCardItem>

    <VCardText class="pt-2">
      <div class="relative pl-5">
        <div class="absolute bottom-2 left-[7px] top-2 w-px bg-black/10 dark:bg-white/10" />

        <div v-for="activity in activities" :key="activity.key" class="relative pb-6 last:pb-0">
          <span
            class="absolute -left-5 top-1 size-3.5 border-2 border-white rounded-full dark:border-[rgb(30,30,34)]"
            :class="activity.dotClass"
          />

          <div class="flex items-center gap-2">
            <VIcon :class="activity.iconClass" :icon="activity.icon" size="15" />
            <span class="text-sm font-500">{{ activity.title }}</span>
          </div>
          <div class="mt-1 text-xs opacity-45">{{ activity.time }}</div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
