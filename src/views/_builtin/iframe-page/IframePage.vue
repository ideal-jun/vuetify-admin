<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'IframePage' });

const { url } = defineProps<{
  url: string;
}>();

const decodedUrl = computed(() => {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
});

const isValidUrl = computed(() => /^https?:\/\//u.test(decodedUrl.value));
</script>

<template>
  <div class="h-full min-h-[70vh] flex flex-col gap-3">
    <VCard class="app-panel" variant="flat">
      <VCardText class="flex items-center gap-3 py-3">
        <VIcon color="primary" icon="mdi-web" />
        <span class="flex-1 truncate text-sm opacity-70">{{ decodedUrl }}</span>
        <VBtn
          :disabled="!isValidUrl"
          :href="decodedUrl"
          icon="mdi-open-in-new"
          size="small"
          variant="text"
        />
      </VCardText>
    </VCard>

    <VAlert v-if="!isValidUrl" type="warning" variant="tonal">
      {{ $t('common.warning') }}
    </VAlert>

    <iframe
      v-else
      allowfullscreen
      class="w-full flex-1 border-0 rounded-2xl bg-white"
      referrerpolicy="no-referrer"
      :src="decodedUrl"
      title="iframe-page"
    />
  </div>
</template>
