<script setup lang="ts">
import SystemLogo from '@/components/common/SystemLogo.vue';
import { $t } from '@/locales';

defineOptions({ name: 'GlobalLogo' });

withDefaults(
  defineProps<{
    /** Whether to show the title */
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);
</script>

<template>
  <RouterLink class="h-16 flex items-center gap-3 overflow-hidden px-5" to="/">
    <SystemLogo class="size-8 shrink-0" />
    <h2
      v-show="showTitle"
      class="text-title-large text-primary font-700 whitespace-nowrap transition duration-300"
    >
      {{ $t('system.title') }}
    </h2>
  </RouterLink>
</template>
