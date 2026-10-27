<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { $t } from '@/locales';
import { downloadUserTemplate, importUserData } from '@/service/api/system-manage';

defineOptions({ name: 'UserImportDialog' });

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const files = ref<File[]>([]);
const updateSupport = ref(false);
const submitting = ref(false);
const templateLoading = ref(false);

const canSubmit = computed(() => files.value.length > 0 && !submitting.value);

watch(visible, (value) => {
  if (!value) {
    return;
  }

  files.value = [];
  updateSupport.value = false;
});

async function handleDownloadTemplate() {
  templateLoading.value = true;

  try {
    await downloadUserTemplate();
  } catch (error) {
    window.$message?.error(error instanceof Error ? error.message : $t('request.networkError'));
  } finally {
    templateLoading.value = false;
  }
}

async function handleImport() {
  const file = files.value[0];

  if (!file) {
    return;
  }

  submitting.value = true;

  try {
    const { message } = await importUserData(file, updateSupport.value);

    window.$message?.success(message || $t('page.system.user.importSuccess'));
    visible.value = false;
    emit('submitted');
  } catch (error) {
    window.$message?.error(error instanceof Error ? error.message : $t('request.networkError'));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <VDialog v-model="visible" max-width="520">
    <VCard>
      <VCardTitle>{{ $t('page.system.user.importTitle') }}</VCardTitle>

      <VCardText>
        <p class="mb-4 text-sm text-medium-emphasis">{{ $t('page.system.user.importDesc') }}</p>

        <VFileInput
          v-model="files"
          accept=".xlsx,.xls"
          :label="$t('page.system.user.selectFile')"
          prepend-icon="mdi-upload-outline"
          show-size
        />

        <VCheckbox
          v-model="updateSupport"
          density="compact"
          :label="$t('page.system.user.updateSupport')"
        />

        <VBtn
          :loading="templateLoading"
          prepend-icon="mdi-download-outline"
          size="small"
          variant="text"
          @click="handleDownloadTemplate"
        >
          {{ $t('page.system.user.downloadTemplate') }}
        </VBtn>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn :disabled="submitting" variant="text" @click="visible = false">
          {{ $t('common.cancel') }}
        </VBtn>
        <VBtn color="primary" :disabled="!canSubmit" :loading="submitting" @click="handleImport">
          {{ $t('common.confirm') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
