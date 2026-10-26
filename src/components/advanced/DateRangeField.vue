<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'DateRangeField' });

const props = withDefaults(
  defineProps<{
    /** Override the field label */
    label?: string;
    /** The text field density */
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  {
    label: undefined,
    density: 'compact',
  },
);

const begin = defineModel<string | null>('begin', { default: null });
const end = defineModel<string | null>('end', { default: null });

const menu = ref(false);
const pickerValue = ref<Date[] | null>(null);

const displayValue = computed(() => {
  if (begin.value && end.value) {
    return `${begin.value} ~ ${end.value}`;
  }

  return begin.value ?? end.value ?? '';
});

const label = computed(() => props.label ?? $t('common.dateRange'));

function toDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function formatDate(value: unknown) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return '';
}

function syncPicker() {
  const dates: Date[] = [];
  const beginDate = toDate(begin.value);
  const endDate = toDate(end.value);

  if (beginDate) {
    dates.push(beginDate);
  }

  if (endDate) {
    dates.push(endDate);
  }

  pickerValue.value = dates.length > 0 ? dates : null;
}

watch([begin, end], syncPicker, { immediate: true });

function handlePickerUpdate(value: unknown) {
  const dates = Array.isArray(value) ? value : [];

  if (dates.length < 2) {
    return;
  }

  const beginDate = formatDate(dates[0]);
  const endDate = formatDate(dates[1]);

  if (!beginDate || !endDate) {
    return;
  }

  begin.value = beginDate;
  end.value = endDate;
  menu.value = false;
}

function clearRange() {
  begin.value = null;
  end.value = null;
  pickerValue.value = null;
}
</script>

<template>
  <VMenu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom start"
    :min-width="320"
    offset="6"
  >
    <template #activator="{ props: activatorProps }">
      <VTextField
        v-bind="activatorProps"
        clearable
        :density="density"
        hide-details
        :label="label"
        :model-value="displayValue"
        :prepend-inner-icon="'mdi-calendar-range'"
        readonly
        @click:clear="clearRange"
      />
    </template>

    <VDatePicker
      v-model="pickerValue"
      color="primary"
      first-day-of-week="1"
      multiple="range"
      show-adjacent-months
      @update:model-value="handlePickerUpdate"
    />
  </VMenu>
</template>
