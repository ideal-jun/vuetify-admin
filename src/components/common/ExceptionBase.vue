<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useRouterPush } from '@/hooks/common/router';

defineOptions({ name: 'ExceptionBase' });

type ExceptionType = '403' | '404' | '500';

const { type } = defineProps<{
  /**
   * Exception type
   *
   * - 403: no permission
   * - 404: not found
   * - 500: service error
   */
  type: ExceptionType;
}>();

const { t } = useI18n();
const { routerPushByKey } = useRouterPush();

const iconMap: Record<ExceptionType, string> = {
  '403': 'mdi-shield-lock-outline',
  '404': 'mdi-map-marker-question-outline',
  '500': 'mdi-server-network-off',
};

const titleMap: Record<ExceptionType, string> = {
  '403': 'route.403',
  '404': 'route.404',
  '500': 'route.500',
};

const icon = computed(() => iconMap[type]);
const title = computed(() => t(titleMap[type]));
</script>

<template>
  <div class="size-full min-h-[520px] flex-col-center gap-6 px-6 text-center">
    <div class="relative">
      <div class="text-[160px] text-primary/10 font-900 leading-none">{{ type }}</div>
      <VIcon class="absolute-center text-[72px] text-primary" :icon="icon" />
    </div>

    <h2 class="text-2xl font-600">{{ title }}</h2>

    <VBtn color="primary" rounded="lg" @click="routerPushByKey('root')">
      {{ $t('common.backToHome') }}
    </VBtn>
  </div>
</template>
