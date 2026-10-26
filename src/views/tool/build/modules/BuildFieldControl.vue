<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

import type { BuilderField } from './types';

defineOptions({ name: 'BuildFieldControl' });

interface Props {
  field: BuilderField;
  modelValue: unknown;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  'update:model-value': [value: unknown];
}>();

const textValue = computed(() => {
  const value = props.modelValue;

  if (typeof value === 'string') {
    return value;
  }

  return value === null || value === undefined ? '' : String(value);
});

const numberValue = computed(() =>
  typeof props.modelValue === 'number' ? props.modelValue : null,
);

const sliderValue = computed(() =>
  typeof props.modelValue === 'number' ? props.modelValue : (props.field.min ?? 0),
);

const booleanValue = computed(() => Boolean(props.modelValue));

const arrayValue = computed<unknown[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [],
);

const scalarValue = computed(() => {
  const value = props.modelValue;

  return typeof value === 'string' || typeof value === 'number' ? value : null;
});

const isDisabled = computed(() => props.disabled || props.field.disabled);

const displayLabel = computed(() => {
  const withStar = props.field.required && props.field.type !== 'button';

  return withStar ? props.field.label + ' *' : props.field.label;
});

const rules = computed<App.Global.FormRule[]>(() => {
  if (!props.field.required) {
    return [];
  }

  const message = $t('page.build.validation.required');

  if (props.field.type === 'checkbox') {
    return [(value: unknown) => (Array.isArray(value) && value.length > 0 ? true : message)];
  }

  if (props.field.type === 'number') {
    return [(value: unknown) => (typeof value === 'number' ? true : message)];
  }

  if (['switch', 'slider', 'button'].includes(props.field.type)) {
    return [];
  }

  return [(value: unknown) => (String(value ?? '').trim().length > 0 ? true : message)];
});

function emitValue(value: unknown) {
  emit('update:model-value', value);
}
</script>

<template>
  <VTextField
    v-if="field.type === 'input'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="textValue"
    :placeholder="field.placeholder"
    :rules="rules"
    @update:model-value="emitValue"
  />

  <VTextarea
    v-else-if="field.type === 'textarea'"
    auto-grow
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="textValue"
    :placeholder="field.placeholder"
    rows="2"
    :rules="rules"
    @update:model-value="emitValue"
  />

  <VTextField
    v-else-if="field.type === 'password'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="textValue"
    :placeholder="field.placeholder"
    :rules="rules"
    type="password"
    @update:model-value="emitValue"
  />

  <VTextField
    v-else-if="field.type === 'date'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="textValue"
    prepend-inner-icon="mdi-calendar"
    :rules="rules"
    type="date"
    @update:model-value="emitValue"
  />

  <VTextField
    v-else-if="field.type === 'time'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="textValue"
    prepend-inner-icon="mdi-clock-outline"
    :rules="rules"
    type="time"
    @update:model-value="emitValue"
  />

  <VNumberInput
    v-else-if="field.type === 'number'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :max="field.max"
    :min="field.min"
    :model-value="numberValue"
    :rules="rules"
    :step="field.step"
    @update:model-value="emitValue"
  />

  <VSelect
    v-else-if="field.type === 'select'"
    clearable
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    item-title="label"
    item-value="value"
    :items="field.options"
    :label="displayLabel"
    :model-value="scalarValue"
    :placeholder="field.placeholder"
    :rules="rules"
    @update:model-value="emitValue"
  />

  <VSwitch
    v-else-if="field.type === 'switch'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="booleanValue"
    @update:model-value="emitValue"
  />

  <VSlider
    v-else-if="field.type === 'slider'"
    density="comfortable"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :max="field.max"
    :min="field.min"
    :model-value="sliderValue"
    :step="field.step"
    @update:model-value="emitValue"
  />

  <VRadioGroup
    v-else-if="field.type === 'radio'"
    :disabled="isDisabled"
    hide-details="auto"
    :label="displayLabel"
    :model-value="scalarValue"
    :rules="rules"
    @update:model-value="emitValue"
  >
    <VRadio
      v-for="(option, index) in field.options"
      :key="index"
      :label="option.label"
      :value="option.value"
    />
  </VRadioGroup>

  <div v-else-if="field.type === 'checkbox'">
    <div class="mb-1 text-sm">{{ displayLabel }}</div>

    <VInput hide-details="auto" :model-value="arrayValue" :rules="rules">
      <div class="d-flex flex-wrap">
        <VCheckbox
          v-for="(option, index) in field.options"
          :key="index"
          class="mr-4"
          :disabled="isDisabled"
          hide-details
          :label="option.label"
          :model-value="arrayValue"
          :value="option.value"
          @update:model-value="emitValue"
        />
      </div>
    </VInput>
  </div>

  <VBtn
    v-else-if="field.type === 'button'"
    :color="field.buttonColor || 'primary'"
    :disabled="isDisabled"
    type="button"
    variant="flat"
  >
    {{ field.buttonText || field.label }}
  </VBtn>
</template>
