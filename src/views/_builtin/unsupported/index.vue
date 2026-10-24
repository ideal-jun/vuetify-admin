<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { $t } from '@/locales';

defineOptions({ name: 'Unsupported' });

const route = useRoute();

const title = computed(() => route.meta.title || $t('page.unsupported.title'));
</script>

<template>
  <div class="flex-col-center h-full gap-4 p-8">
    <VCard class="app-panel w-full max-w-xl" variant="flat">
      <VCardText class="flex flex-col items-center gap-4 py-10 text-center">
        <VIcon color="primary" icon="mdi-tools" size="56"></VIcon>
        <h2 class="text-title-large">{{ title }}</h2>
        <p class="text-body-medium text-medium-emphasis">
          {{ $t('page.unsupported.description') }}
        </p>
        <VChip color="primary" variant="tonal">{{ route.fullPath }}</VChip>
      </VCardText>
    </VCard>
  </div>
</template>
