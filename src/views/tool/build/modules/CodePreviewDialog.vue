<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';

import BuildFieldControl from './BuildFieldControl.vue';
import { generateVueCode, stringifyDocument } from './code-generator';
import { createInitialValue } from './field-config';
import { copyText, downloadTextFile } from './file-actions';
import type { BuilderField, BuilderFormConfig } from './types';

defineOptions({ name: 'CodePreviewDialog' });

type PreviewTab = 'preview' | 'json' | 'code';

interface Props {
  fields: BuilderField[];
  form: BuilderFormConfig;
  initialTab: PreviewTab;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const tab = ref<PreviewTab>('preview');
const previewValues = ref<Record<string, unknown>>({});

const json = computed(() => stringifyDocument(props.form, props.fields));
const code = computed(() => generateVueCode(props.form, props.fields));
const activeText = computed(() => (tab.value === 'code' ? code.value : json.value));
const canCopy = computed(() => tab.value !== 'preview');

watch(visible, (value) => {
  if (!value) {
    return;
  }

  tab.value = props.initialTab;
  resetPreview();
});

function resetPreview() {
  const values: Record<string, unknown> = {};

  for (const field of props.fields) {
    if (field.type !== 'button') {
      values[field.model] = createInitialValue(field);
    }
  }

  previewValues.value = values;
  resetValidation();
}

function setPreviewValue(model: string, value: unknown) {
  previewValues.value[model] = value;
}

async function handleSubmit() {
  const result = await validate();

  if (!result || !result.valid) {
    return;
  }

  window.$message?.success($t('page.build.preview.submitSuccess'));
}

function handleReset() {
  resetPreview();
}

async function handleCopy() {
  const copied = await copyText(activeText.value);

  if (copied) {
    window.$message?.success($t('page.build.preview.copySuccess'));
  } else {
    window.$message?.error($t('page.build.preview.copyFailed'));
  }
}

function handleDownload() {
  downloadTextFile('form-builder.vue', code.value);
}
</script>

<template>
  <VDialog v-model="visible" :fullscreen="mobile" max-width="1080" scrollable>
    <VCard class="flex max-h-[90vh] flex-col">
      <VCardTitle class="flex items-center justify-between gap-2 px-5 py-3">
        <span class="text-lg font-700">{{ $t('page.build.preview.title') }}</span>
        <VBtn
          :aria-label="$t('page.build.preview.close')"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="visible = false"
        />
      </VCardTitle>

      <VTabs v-model="tab" color="primary" density="compact">
        <VTab prepend-icon="mdi-eye-outline" value="preview">
          {{ $t('page.build.preview.preview') }}
        </VTab>
        <VTab prepend-icon="mdi-code-json" value="json">
          {{ $t('page.build.preview.json') }}
        </VTab>
        <VTab prepend-icon="mdi-xml" value="code">
          {{ $t('page.build.preview.code') }}
        </VTab>
      </VTabs>

      <VDivider />

      <VCardText class="min-h-0 flex-1 overflow-y-auto">
        <div v-if="tab === 'preview'">
          <div
            v-if="fields.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <VIcon class="opacity-20" icon="mdi-form-select" size="56" />
            <div class="mt-3 text-sm opacity-50">{{ $t('page.build.preview.empty') }}</div>
          </div>

          <VForm
            v-else
            ref="formRef"
            :disabled="form.disabled"
            :model="previewValues"
            @submit.prevent="handleSubmit"
          >
            <VRow>
              <VCol
                v-for="field in fields"
                :key="field.id"
                :cols="12"
                :md="field.span < 12 ? field.span : undefined"
              >
                <BuildFieldControl
                  :field="field"
                  :model-value="previewValues[field.model]"
                  @update:model-value="(value) => setPreviewValue(field.model, value)"
                />
              </VCol>

              <VCol v-if="form.showActions" class="d-flex gap-2 pt-2" cols="12">
                <VBtn color="primary" type="submit">{{ form.submitText }}</VBtn>
                <VBtn type="button" variant="text" @click="handleReset">
                  {{ form.resetText }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </div>

        <div v-else-if="tab === 'json'" class="flex flex-col gap-2">
          <div class="text-xs opacity-60">{{ $t('page.build.preview.jsonHint') }}</div>
          <pre
            class="overflow-x-auto rounded-lg bg-black/5 p-4 font-mono text-xs leading-relaxed"
            >{{ json }}</pre>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div class="text-xs opacity-60">{{ $t('page.build.preview.codeHint') }}</div>
          <pre
            class="overflow-x-auto rounded-lg bg-black/5 p-4 font-mono text-xs leading-relaxed"
            >{{ code }}</pre>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="justify-end gap-2 px-4 py-3">
        <VBtn
          v-if="tab === 'code'"
          prepend-icon="mdi-download"
          variant="tonal"
          @click="handleDownload"
        >
          {{ $t('page.build.preview.download') }}
        </VBtn>
        <VBtn v-if="canCopy" prepend-icon="mdi-content-copy" variant="tonal" @click="handleCopy">
          {{ $t('page.build.preview.copy') }}
        </VBtn>
        <VBtn color="primary" variant="flat" @click="visible = false">
          {{ $t('page.build.preview.close') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
