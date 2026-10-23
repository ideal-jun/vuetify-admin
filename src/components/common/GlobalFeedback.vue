<script setup lang="ts">
import { computed } from 'vue';

import {
  cancelDialog,
  closeDialog,
  confirmDialog,
  dialogState,
  getDialogTitle,
  messageQueue,
  notificationQueue,
} from '@/plugins/feedback';

defineOptions({ name: 'GlobalFeedback' });

const dialogTitle = computed(() => dialogState.options?.title || getDialogTitle(dialogState.type));

const dialogColor = computed(() => {
  const colors: Record<App.Global.MessageType, string> = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
  };

  return colors[dialogState.type];
});
</script>

<template>
  <div class="pointer-events-none fixed right-6 top-6 z-[3000] flex w-[360px] flex-col gap-3">
    <VAlert
      v-for="message in messageQueue"
      :key="message.id"
      class="pointer-events-auto"
      elevation="4"
      :type="message.type"
      variant="elevated"
    >
      {{ message.content }}
    </VAlert>

    <VCard
      v-for="notification in notificationQueue"
      :key="notification.id"
      class="pointer-events-auto border-l-4"
      elevation="6"
      :style="{ borderLeftColor: `rgb(var(--v-theme-${notification.type}))` }"
    >
      <VCardItem>
        <VCardTitle class="text-base font-600">{{ notification.title }}</VCardTitle>
        <VCardText class="pt-1 text-sm opacity-80">{{ notification.content }}</VCardText>
      </VCardItem>
    </VCard>
  </div>

  <VDialog
    :model-value="dialogState.visible"
    :persistent="dialogState.options?.maskClosable === false"
    width="420"
    @update:model-value="(value) => !value && closeDialog()"
  >
    <VCard v-if="dialogState.options">
      <VCardItem>
        <template #prepend>
          <VIcon
            :color="dialogColor"
            :icon="`mdi-${dialogState.type === 'info' ? 'information' : dialogState.type}-outline`"
          />
        </template>
        <VCardTitle class="text-base font-600">{{ dialogTitle }}</VCardTitle>
      </VCardItem>

      <VCardText class="text-sm leading-6">{{ dialogState.options.content }}</VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="cancelDialog">
          {{ dialogState.options.negativeText || $t('common.cancel') }}
        </VBtn>
        <VBtn :color="dialogColor" @click="confirmDialog">
          {{ dialogState.options.positiveText || $t('common.confirm') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
