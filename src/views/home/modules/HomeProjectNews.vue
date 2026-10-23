<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'HomeProjectNews' });

const news = computed(() => [
  {
    key: 'item1',
    title: $t('page.home.projectNews.item1'),
    desc: $t('page.home.projectNews.item1Desc'),
    icon: 'mdi-package-variant-closed',
    color: 'primary',
    iconClass: 'bg-primary/10 text-primary',
  },
  {
    key: 'item2',
    title: $t('page.home.projectNews.item2'),
    desc: $t('page.home.projectNews.item2Desc'),
    icon: 'mdi-speedometer',
    color: 'success',
    iconClass: 'bg-success/10 text-success',
  },
  {
    key: 'item3',
    title: $t('page.home.projectNews.item3'),
    desc: $t('page.home.projectNews.item3Desc'),
    icon: 'mdi-check-decagram-outline',
    color: 'info',
    iconClass: 'bg-info/10 text-info',
  },
  {
    key: 'item4',
    title: $t('page.home.projectNews.item4'),
    desc: $t('page.home.projectNews.item4Desc'),
    icon: 'mdi-palette-outline',
    color: 'warning',
    iconClass: 'bg-warning/10 text-warning',
  },
]);
</script>

<template>
  <VCard class="app-panel h-full" variant="flat">
    <VCardItem class="pb-2">
      <VCardTitle class="text-base font-600">{{ $t('page.home.projectNews.title') }}</VCardTitle>

      <template #append>
        <VBtn class="text-none" size="small" variant="text">
          {{ $t('page.home.projectNews.more') }}
          <VIcon class="ml-1" icon="mdi-arrow-right" size="16" />
        </VBtn>
      </template>
    </VCardItem>

    <VCardText class="pt-1">
      <div class="flex flex-col divide-y divide-black/5 dark:divide-white/10">
        <div v-for="item in news" :key="item.key" class="flex gap-3 py-3 first:pt-0 last:pb-0">
          <div
            class="mt-0.5 size-9 shrink-0 flex items-center justify-center rounded-xl"
            :class="item.iconClass"
          >
            <VIcon :icon="item.icon" size="18" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-600">{{ item.title }}</div>
            <div class="mt-0.5 line-clamp-2 text-xs leading-5 opacity-55">{{ item.desc }}</div>
          </div>

          <VIcon class="mt-1 opacity-25" icon="mdi-chevron-right" size="18" />
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
