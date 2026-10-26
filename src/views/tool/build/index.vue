<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { $t } from '@/locales';

import BuildCanvas from './modules/BuildCanvas.vue';
import BuildPalette from './modules/BuildPalette.vue';
import BuildPropertyPanel from './modules/BuildPropertyPanel.vue';
import CodePreviewDialog from './modules/CodePreviewDialog.vue';
import {
  cloneField,
  createDefaultFormConfig,
  createField,
  createInitialValue,
} from './modules/field-config';
import type { BuilderField, BuilderFieldType, BuilderFormConfig } from './modules/types';

defineOptions({ name: 'ToolBuild' });

type PreviewTab = 'preview' | 'json' | 'code';

let fieldIdSeed = 100;

function nextFieldId() {
  fieldIdSeed += 1;

  return fieldIdSeed;
}

const fields = ref<BuilderField[]>([]);
const values = reactive<Record<string, unknown>>({});
const activeId = ref<number | null>(null);
const form = reactive(createDefaultFormConfig());

const previewVisible = ref(false);
const previewTab = ref<PreviewTab>('preview');

const activeField = computed(
  () => fields.value.find((field) => field.id === activeId.value) ?? null,
);

const existingModels = computed(() =>
  fields.value.filter((field) => field.id !== activeId.value).map((field) => field.model),
);

function usedModels() {
  return fields.value.map((field) => field.model);
}

function addField(type: BuilderFieldType, index = fields.value.length) {
  const field = createField(type, nextFieldId(), usedModels());
  const target = Math.min(Math.max(index, 0), fields.value.length);

  fields.value.splice(target, 0, field);
  values[field.model] = createInitialValue(field);
  activeId.value = field.id;
}

function cloneFieldById(id: number) {
  const index = fields.value.findIndex((field) => field.id === id);
  const source = fields.value[index];

  if (!source) {
    return;
  }

  const clone = cloneField(source, nextFieldId(), usedModels());

  fields.value.splice(index + 1, 0, clone);
  values[clone.model] = createInitialValue(clone);
  activeId.value = clone.id;
}

function removeField(id: number) {
  const index = fields.value.findIndex((field) => field.id === id);

  if (index === -1) {
    return;
  }

  const [removed] = fields.value.splice(index, 1);

  if (removed) {
    delete values[removed.model];
  }

  if (activeId.value === id) {
    const next = fields.value[index] ?? fields.value[index - 1] ?? null;
    activeId.value = next ? next.id : null;
  }
}

function moveFieldBy(index: number, offset: number) {
  const target = index + offset;
  const current = fields.value[index];
  const targetField = fields.value[target];

  if (!current || !targetField) {
    return;
  }

  fields.value[index] = targetField;
  fields.value[target] = current;
}

function reorderField(from: number, to: number) {
  if (from < 0 || from >= fields.value.length) {
    return;
  }

  let target = to;

  if (from < target) {
    target -= 1;
  }

  if (target === from) {
    return;
  }

  const [item] = fields.value.splice(from, 1);

  if (!item) {
    return;
  }

  fields.value.splice(Math.min(Math.max(target, 0), fields.value.length), 0, item);
}

function selectField(id: number | null) {
  activeId.value = id;
}

function updateValue(id: number, value: unknown) {
  const field = fields.value.find((item) => item.id === id);

  if (field) {
    values[field.model] = value;
  }
}

function updateActiveField(patch: Partial<BuilderField>) {
  const field = activeField.value;

  if (!field) {
    return;
  }

  Object.assign(field, patch);

  if ('defaultValue' in patch) {
    values[field.model] = createInitialValue(field);
  }
}

function renameActiveField(model: string) {
  const field = activeField.value;

  if (!field || model === field.model) {
    return;
  }

  const previous = field.model;

  values[model] = values[previous];
  delete values[previous];
  field.model = model;
}

function updateForm(patch: Partial<BuilderFormConfig>) {
  Object.assign(form, patch);
}

function openPreview(tab: PreviewTab) {
  previewTab.value = tab;
  previewVisible.value = true;
}

function resetBuilder() {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.build.messages.resetConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      fields.value = [];
      activeId.value = null;

      for (const key of Object.keys(values)) {
        delete values[key];
      }

      Object.assign(form, createDefaultFormConfig());
      window.$message?.success($t('page.build.messages.resetSuccess'));
    },
  });
}
</script>

<template>
  <div class="flex min-h-full flex-col gap-3 md:h-full md:min-h-0">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <VAvatar color="primary" size="42" variant="tonal">
          <VIcon icon="mdi-form-select" size="24" />
        </VAvatar>

        <div>
          <div class="text-lg font-700">{{ $t('page.build.title') }}</div>
          <div class="mt-0.5 text-xs opacity-60">{{ $t('page.build.subtitle') }}</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <VBtn
          color="primary"
          prepend-icon="mdi-eye-outline"
          variant="flat"
          @click="openPreview('preview')"
        >
          {{ $t('page.build.toolbar.preview') }}
        </VBtn>
        <VBtn prepend-icon="mdi-code-json" variant="tonal" @click="openPreview('json')">
          {{ $t('page.build.toolbar.json') }}
        </VBtn>
        <VBtn prepend-icon="mdi-xml" variant="tonal" @click="openPreview('code')">
          {{ $t('page.build.toolbar.code') }}
        </VBtn>
        <VBtn color="error" prepend-icon="mdi-restore" variant="text" @click="resetBuilder">
          {{ $t('page.build.toolbar.reset') }}
        </VBtn>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-[16rem_minmax(0,1fr)_20rem]">
      <BuildPalette class="min-h-[240px] lg:min-h-0" @add="(type) => addField(type)" />

      <VSheet
        class="app-panel flex min-h-[420px] min-w-0 flex-col overflow-hidden lg:min-h-0"
        rounded="lg"
      >
        <div class="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="text-sm font-700">{{ $t('page.build.canvas.title') }}</div>
            <VChip color="primary" size="x-small" variant="tonal">
              {{ $t('page.build.canvas.count', { count: fields.length }) }}
            </VChip>
          </div>
          <div class="text-xs opacity-50">{{ $t('page.build.canvas.hint') }}</div>
        </div>

        <VDivider />

        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <BuildCanvas
            :active-id="activeId"
            :fields="fields"
            :values="values"
            @add="addField"
            @clone="cloneFieldById"
            @move-by="moveFieldBy"
            @remove="removeField"
            @reorder="reorderField"
            @select="selectField"
            @update-value="updateValue"
          />
        </div>
      </VSheet>

      <BuildPropertyPanel
        class="min-h-[360px] lg:min-h-0"
        :existing-models="existingModels"
        :field="activeField"
        :form="form"
        @rename-model="renameActiveField"
        @update-field="updateActiveField"
        @update-form="updateForm"
      />
    </div>

    <CodePreviewDialog
      v-model:visible="previewVisible"
      :fields="fields"
      :form="form"
      :initial-tab="previewTab"
    />
  </div>
</template>
