<script setup lang="ts">
import GlobalFeedback from '@/components/common/GlobalFeedback.vue';

import GlobalContent from '../modules/global-content/index.vue';

defineOptions({ name: 'BlankLayout' });
</script>

<template>
  <VApp>
    <VMain class="bg-layout">
      <GlobalContent :show-padding="false" />
    </VMain>

    <GlobalFeedback />
  </VApp>
</template>
