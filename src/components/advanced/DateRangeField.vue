<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'DateRangeField' });

const {
  beginLabel,
  endLabel,
  density = 'compact',
} = defineProps<{
  /** Override the start date label */
  beginLabel?: string;
  /** Override the end date label */
  endLabel?: string;
  /** The text field density */
  density?: 'default' | 'comfortable' | 'compact';
}>();

const begin = defineModel<string | null>('begin', { default: null });
const end = defineModel<string | null>('end', { default: null });

const beginLabelText = computed(() => beginLabel ?? $t('common.startDate'));
const endLabelText = computed(() => endLabel ?? $t('common.endDate'));

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

  return null;
}

const beginDate = computed<unknown>({
  get: () => begin.value,
  set: (value: unknown) => {
    begin.value = formatDate(value);
  },
});

const endDate = computed<unknown>({
  get: () => end.value,
  set: (value: unknown) => {
    end.value = formatDate(value);
  },
});
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row">
    <VDateInput
      v-model="beginDate"
      class="min-w-0 flex-1"
      clearable
      :density="density"
      hide-details
      :label="beginLabelText"
      prepend-icon=""
      :prepend-inner-icon="'mdi-calendar-start'"
      variant="outlined"
    />

    <VDateInput
      v-model="endDate"
      class="min-w-0 flex-1"
      clearable
      :density="density"
      hide-details
      :label="endLabelText"
      prepend-icon=""
      :prepend-inner-icon="'mdi-calendar-end'"
      variant="outlined"
    />
  </div>
</template>
