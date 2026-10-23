<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const error = ref<Error | null>(null);

onErrorCaptured((caught) => {
  error.value = caught instanceof Error ? caught : new Error(String(caught));

  return false;
});

function reset() {
  error.value = null;
}
</script>

<template>
  <slot v-if="!error" />

  <VAlert v-else class="m-4" type="error" variant="tonal">
    <VAlertTitle>{{ t('common.error') }}</VAlertTitle>
    <p class="mt-1">{{ error.message }}</p>
    <VBtn class="mt-3" size="small" variant="text" @click="reset">{{ t('common.refresh') }}</VBtn>
  </VAlert>
</template>
