<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { $t } from '@/locales';

import { buttonColors, hasOptions, hasPlaceholder, isTextType } from './field-config';
import type { BuilderField, BuilderFormConfig } from './types';

defineOptions({ name: 'BuildPropertyPanel' });

interface Props {
  field: BuilderField | null;
  form: BuilderFormConfig;
  existingModels: string[];
}

const { field, form, existingModels } = defineProps<Props>();

const emit = defineEmits<{
  'rename-model': [model: string];
  'update-field': [patch: Partial<BuilderField>];
  'update-form': [patch: Partial<BuilderFormConfig>];
}>();

type PanelTab = 'field' | 'form';

const tab = ref<PanelTab>('field');

const identifierPattern = /^[A-Z_$][\w$]*$/i;

const fieldNameDraft = ref('');
const fieldNameError = ref('');
const formRefDraft = ref('');
const formRefError = ref('');
const modelNameDraft = ref('');
const modelNameError = ref('');

const showPlaceholder = computed(() => Boolean(field && hasPlaceholder(field.type)));
const showOptions = computed(() => Boolean(field && hasOptions(field.type)));
const showNumberSettings = computed(() => field?.type === 'number' || field?.type === 'slider');
const showTextDefault = computed(() => Boolean(field && isTextType(field.type)));
const showChoiceDefault = computed(() => field?.type === 'select' || field?.type === 'radio');
const isButton = computed(() => field?.type === 'button');
const isNumber = computed(() => field?.type === 'number');
const isSlider = computed(() => field?.type === 'slider');
const isSwitch = computed(() => field?.type === 'switch');
const isCheckbox = computed(() => field?.type === 'checkbox');

const optionItems = computed(() =>
  (field?.options ?? []).map((option) => ({ title: option.label, value: option.value })),
);

const defaultText = computed(() => {
  const value = field?.defaultValue;

  if (typeof value === 'string') {
    return value;
  }

  return value === null || value === undefined ? '' : String(value);
});

const defaultNumber = computed(() =>
  typeof field?.defaultValue === 'number' ? field.defaultValue : null,
);

const defaultSlider = computed(() => {
  const value = field?.defaultValue;

  return typeof value === 'number' ? value : (field?.min ?? 0);
});

const defaultBoolean = computed(() => Boolean(field?.defaultValue));

const defaultChoice = computed(() => {
  const value = field?.defaultValue;

  return typeof value === 'string' || typeof value === 'number' ? value : null;
});

const defaultArray = computed(() => {
  const value = field?.defaultValue;

  return Array.isArray(value) ? value : [];
});

watch(
  () => field?.id,
  () => {
    fieldNameDraft.value = field?.model ?? '';
    fieldNameError.value = '';
  },
  { immediate: true },
);

watch(
  () => form.formRef,
  (value) => {
    formRefDraft.value = value;
    formRefError.value = '';
  },
  { immediate: true },
);

watch(
  () => form.modelName,
  (value) => {
    modelNameDraft.value = value;
    modelNameError.value = '';
  },
  { immediate: true },
);

function patchField(patch: Partial<BuilderField>) {
  emit('update-field', patch);
}

function onFieldNameInput(value: unknown) {
  const next = String(value ?? '');
  fieldNameDraft.value = next;

  if (!identifierPattern.test(next)) {
    fieldNameError.value = $t('page.build.field.invalidModel');
    return;
  }

  if (existingModels.includes(next)) {
    fieldNameError.value = $t('page.build.field.duplicateModel');
    return;
  }

  fieldNameError.value = '';

  if (field && next !== field.model) {
    emit('rename-model', next);
  }
}

function resetFieldName() {
  fieldNameDraft.value = field?.model ?? '';
  fieldNameError.value = '';
}

function onFormRefInput(value: unknown) {
  const next = String(value ?? '');
  formRefDraft.value = next;

  if (!identifierPattern.test(next)) {
    formRefError.value = $t('page.build.form.invalidIdentifier');
    return;
  }

  if (next === form.modelName) {
    formRefError.value = $t('page.build.form.duplicateIdentifier');
    return;
  }

  formRefError.value = '';

  if (next !== form.formRef) {
    emit('update-form', { formRef: next });
  }
}

function resetFormRef() {
  formRefDraft.value = form.formRef;
  formRefError.value = '';
}

function onModelNameInput(value: unknown) {
  const next = String(value ?? '');
  modelNameDraft.value = next;

  if (!identifierPattern.test(next)) {
    modelNameError.value = $t('page.build.form.invalidIdentifier');
    return;
  }

  if (next === form.formRef) {
    modelNameError.value = $t('page.build.form.duplicateIdentifier');
    return;
  }

  modelNameError.value = '';

  if (next !== form.modelName) {
    emit('update-form', { modelName: next });
  }
}

function resetModelName() {
  modelNameDraft.value = form.modelName;
  modelNameError.value = '';
}

function updateDefaultText(value: unknown) {
  patchField({ defaultValue: value === null || value === undefined ? '' : String(value) });
}

function updateDefaultNumber(value: unknown) {
  patchField({ defaultValue: typeof value === 'number' ? value : null });
}

function updateDefaultSlider(value: unknown) {
  patchField({ defaultValue: typeof value === 'number' ? value : (field?.min ?? 0) });
}

function updateDefaultBoolean(value: unknown) {
  patchField({ defaultValue: Boolean(value) });
}

function updateDefaultChoice(value: unknown) {
  patchField({ defaultValue: value ?? null });
}

function updateDefaultArray(value: unknown) {
  patchField({ defaultValue: Array.isArray(value) ? [...value] : [] });
}

function updateNumberSetting(key: 'min' | 'max' | 'step', value: unknown) {
  const patch: Partial<BuilderField> = { [key]: typeof value === 'number' ? value : undefined };

  patchField(patch);
}

function parseOptionValue(raw: string): string | number {
  const value = raw.trim();

  if (value !== '' && /^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return raw;
}

function addOption() {
  const currentField = field;

  if (!currentField) {
    return;
  }

  patchField({
    options: [...currentField.options, { label: '', value: currentField.options.length + 1 }],
  });
}

function updateOptionLabel(index: number, value: unknown) {
  const currentField = field;

  if (!currentField) {
    return;
  }

  patchField({
    options: currentField.options.map((option, current) =>
      current === index ? { ...option, label: String(value ?? '') } : option,
    ),
  });
}

function updateOptionValue(index: number, value: unknown) {
  const currentField = field;

  if (!currentField) {
    return;
  }

  const nextValue = parseOptionValue(String(value ?? ''));

  patchField({
    options: currentField.options.map((option, current) =>
      current === index ? { ...option, value: nextValue } : option,
    ),
  });
}

function removeOption(index: number) {
  const currentField = field;

  if (!currentField) {
    return;
  }

  patchField({ options: currentField.options.filter((option, current) => current !== index) });
}

function moveOption(index: number, offset: number) {
  const currentField = field;

  if (!currentField) {
    return;
  }

  const target = index + offset;

  if (target < 0 || target >= currentField.options.length) {
    return;
  }

  const options = [...currentField.options];
  const current = options[index];
  const targetOption = options[target];

  if (!current || !targetOption) {
    return;
  }

  options[index] = targetOption;
  options[target] = current;

  patchField({ options });
}
</script>

<template>
  <VSheet class="app-panel flex min-h-0 flex-col overflow-hidden" rounded="lg">
    <VTabs v-model="tab" color="primary" density="compact" grow>
      <VTab prepend-icon="mdi-tune-variant" value="field">
        {{ $t('page.build.tabs.field') }}
      </VTab>
      <VTab prepend-icon="mdi-form-select" value="form">
        {{ $t('page.build.tabs.form') }}
      </VTab>
    </VTabs>

    <VDivider />

    <div class="min-h-0 flex-1 overflow-y-auto p-4">
      <div v-if="tab === 'field'">
        <div v-if="!field" class="flex flex-col items-center justify-center py-16 text-center">
          <VIcon class="opacity-20" icon="mdi-cursor-default-click-outline" size="48" />
          <div class="mt-3 text-sm font-600">{{ $t('page.build.field.empty') }}</div>
          <div class="mt-1 max-w-[220px] text-xs opacity-50">
            {{ $t('page.build.field.emptyHint') }}
          </div>
        </div>

        <div v-else class="flex flex-col gap-3">
          <VTextField
            density="compact"
            hide-details
            :label="$t('page.build.field.label')"
            :model-value="field.label"
            @update:model-value="(value) => patchField({ label: String(value ?? '') })"
          />

          <VTextField
            density="compact"
            :error-messages="fieldNameError"
            hide-details
            :label="$t('page.build.field.model')"
            :model-value="fieldNameDraft"
            @blur="resetFieldName"
            @update:model-value="onFieldNameInput"
          />

          <VTextField
            v-if="showPlaceholder"
            density="compact"
            hide-details
            :label="$t('page.build.field.placeholder')"
            :model-value="field.placeholder"
            @update:model-value="(value) => patchField({ placeholder: String(value ?? '') })"
          />

          <div>
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="opacity-70">{{ $t('page.build.field.span') }}</span>
              <span class="opacity-50">
                {{ $t('page.build.field.spanValue', { value: field.span }) }}
              </span>
            </div>

            <VSlider
              density="compact"
              hide-details
              :max="12"
              :min="1"
              :model-value="field.span"
              step="1"
              @update:model-value="(value) => patchField({ span: Number(value) })"
            />
          </div>

          <template v-if="!isButton">
            <VTextField
              v-if="showTextDefault"
              density="compact"
              hide-details
              :label="$t('page.build.field.defaultValue')"
              :model-value="defaultText"
              :type="field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'"
              @update:model-value="updateDefaultText"
            />

            <VNumberInput
              v-else-if="isNumber"
              density="compact"
              hide-details
              :label="$t('page.build.field.defaultValue')"
              :max="field.max"
              :min="field.min"
              :model-value="defaultNumber"
              :step="field.step"
              @update:model-value="updateDefaultNumber"
            />

            <VSlider
              v-else-if="isSlider"
              density="compact"
              hide-details
              :label="$t('page.build.field.defaultValue')"
              :max="field.max ?? 100"
              :min="field.min ?? 0"
              :model-value="defaultSlider"
              :step="field.step ?? 1"
              @update:model-value="updateDefaultSlider"
            />

            <VSwitch
              v-else-if="isSwitch"
              density="compact"
              hide-details
              :label="$t('page.build.field.defaultValue')"
              :model-value="defaultBoolean"
              @update:model-value="updateDefaultBoolean"
            />

            <VSelect
              v-else-if="showChoiceDefault"
              clearable
              density="compact"
              hide-details
              :items="optionItems"
              :label="$t('page.build.field.defaultValue')"
              :model-value="defaultChoice"
              @update:model-value="updateDefaultChoice"
            />

            <VSelect
              v-else-if="isCheckbox"
              chips
              clearable
              closable-chips
              density="compact"
              hide-details
              :items="optionItems"
              :label="$t('page.build.field.defaultValue')"
              :model-value="defaultArray"
              multiple
              @update:model-value="updateDefaultArray"
            />
          </template>

          <VSwitch
            v-if="!isButton"
            density="compact"
            hide-details
            :label="$t('page.build.field.required')"
            :model-value="field.required"
            @update:model-value="(value) => patchField({ required: Boolean(value) })"
          />

          <VSwitch
            density="compact"
            hide-details
            :label="$t('page.build.field.disabled')"
            :model-value="field.disabled"
            @update:model-value="(value) => patchField({ disabled: Boolean(value) })"
          />

          <template v-if="isButton">
            <VTextField
              density="compact"
              hide-details
              :label="$t('page.build.field.buttonText')"
              :model-value="field.buttonText"
              @update:model-value="(value) => patchField({ buttonText: String(value ?? '') })"
            />

            <VSelect
              density="compact"
              hide-details
              :items="buttonColors"
              :label="$t('page.build.field.buttonColor')"
              :model-value="field.buttonColor || 'primary'"
              @update:model-value="
                (value) => patchField({ buttonColor: String(value ?? 'primary') })
              "
            />
          </template>

          <div v-if="showNumberSettings" class="grid grid-cols-3 gap-2">
            <VNumberInput
              density="compact"
              hide-details
              :label="$t('page.build.field.min')"
              :model-value="field.min ?? null"
              @update:model-value="(value) => updateNumberSetting('min', value)"
            />
            <VNumberInput
              density="compact"
              hide-details
              :label="$t('page.build.field.max')"
              :model-value="field.max ?? null"
              @update:model-value="(value) => updateNumberSetting('max', value)"
            />
            <VNumberInput
              density="compact"
              hide-details
              :label="$t('page.build.field.step')"
              :model-value="field.step ?? null"
              @update:model-value="(value) => updateNumberSetting('step', value)"
            />
          </div>

          <div v-if="showOptions" class="border-t pt-3">
            <div class="mb-2 text-xs font-700 uppercase opacity-60">
              {{ $t('page.build.field.options') }}
            </div>

            <div class="flex flex-col gap-2">
              <div
                v-for="(option, index) in field.options"
                :key="index"
                class="flex items-center gap-1"
              >
                <VTextField
                  density="compact"
                  hide-details
                  :model-value="option.label"
                  :placeholder="$t('page.build.field.optionLabel')"
                  @update:model-value="(value) => updateOptionLabel(index, value)"
                />
                <VTextField
                  density="compact"
                  hide-details
                  :model-value="String(option.value)"
                  :placeholder="$t('page.build.field.optionValue')"
                  @update:model-value="(value) => updateOptionValue(index, value)"
                />

                <div class="flex flex-col">
                  <VBtn
                    :aria-label="$t('page.build.field.moveOptionUp')"
                    density="compact"
                    :disabled="index === 0"
                    icon="mdi-chevron-up"
                    size="x-small"
                    variant="text"
                    @click="moveOption(index, -1)"
                  />
                  <VBtn
                    :aria-label="$t('page.build.field.moveOptionDown')"
                    density="compact"
                    :disabled="index === field.options.length - 1"
                    icon="mdi-chevron-down"
                    size="x-small"
                    variant="text"
                    @click="moveOption(index, 1)"
                  />
                </div>

                <VBtn
                  :aria-label="$t('page.build.field.removeOption')"
                  color="error"
                  density="compact"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  @click="removeOption(index)"
                />
              </div>
            </div>

            <VBtn
              class="mt-2"
              density="compact"
              prepend-icon="mdi-plus"
              size="small"
              variant="text"
              @click="addOption"
            >
              {{ $t('page.build.field.addOption') }}
            </VBtn>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-3">
        <VTextField
          density="compact"
          :error-messages="formRefError"
          hide-details
          :label="$t('page.build.form.formRef')"
          :model-value="formRefDraft"
          @blur="resetFormRef"
          @update:model-value="onFormRefInput"
        />

        <VTextField
          density="compact"
          :error-messages="modelNameError"
          hide-details
          :label="$t('page.build.form.modelName')"
          :model-value="modelNameDraft"
          @blur="resetModelName"
          @update:model-value="onModelNameInput"
        />

        <VTextField
          density="compact"
          hide-details
          :label="$t('page.build.form.submitText')"
          :model-value="form.submitText"
          @update:model-value="(value) => emit('update-form', { submitText: String(value ?? '') })"
        />

        <VTextField
          density="compact"
          hide-details
          :label="$t('page.build.form.resetText')"
          :model-value="form.resetText"
          @update:model-value="(value) => emit('update-form', { resetText: String(value ?? '') })"
        />

        <VSwitch
          density="compact"
          hide-details
          :label="$t('page.build.form.showActions')"
          :model-value="form.showActions"
          @update:model-value="(value) => emit('update-form', { showActions: Boolean(value) })"
        />

        <VSwitch
          density="compact"
          hide-details
          :label="$t('page.build.form.disabled')"
          :model-value="form.disabled"
          @update:model-value="(value) => emit('update-form', { disabled: Boolean(value) })"
        />
      </div>
    </div>
  </VSheet>
</template>
