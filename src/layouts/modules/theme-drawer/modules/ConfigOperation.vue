<script setup lang="ts">
import { computed, ref } from 'vue';

import { $t } from '@/locales';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({
  name: 'ConfigOperation',
});

const themeStore = useThemeStore();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const dataClipboardText = computed(() => {
  const reg = /"\w+":/g;

  return themeStore.settingsJson.replace(reg, (match) => match.replace(/"/g, ''));
});

function handleReset() {
  themeStore.resetStore();

  setTimeout(() => {
    window.$message?.success($t('theme.configOperation.resetSuccessMsg'));
  }, 50);
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(dataClipboardText.value);
    window.$message?.success($t('theme.configOperation.copySuccessMsg'));
  } catch {
    textareaRef.value?.select();
    document.execCommand('copy');
    window.$message?.success($t('theme.configOperation.copySuccessMsg'));
  }
}
</script>

<template>
  <div class="w-full flex justify-between p-4">
    <textarea
      ref="textareaRef"
      class="absolute -z-1 opacity-0"
      readonly
      :value="dataClipboardText"
    />

    <VBtn color="error" variant="outlined" @click="handleReset">
      {{ $t('theme.configOperation.resetConfig') }}
    </VBtn>

    <VBtn color="primary" @click="handleCopy">
      {{ $t('theme.configOperation.copyConfig') }}
    </VBtn>
  </div>
</template>
