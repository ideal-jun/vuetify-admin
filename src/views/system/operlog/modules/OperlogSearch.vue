<script setup lang="ts">
import { computed } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import { $t } from '@/locales';
import { translateOptions, transformRecordToOption } from '@/utils/common';

import { businessTypeOptions, operlogStatusRecord } from './shared';

defineOptions({ name: 'OperlogSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemOperlog.SearchModel>('model', { required: true });

const statusOptions = computed(() =>
  translateOptions(transformRecordToOption(operlogStatusRecord)),
);

const businessTypes = computed(() =>
  businessTypeOptions.map((option) => ({
    value: option.value,
    label: $t(option.label),
  })),
);

function handleReset() {
  model.value.title = null;
  model.value.operName = null;
  model.value.businessType = null;
  model.value.status = null;
  model.value.beginTime = null;
  model.value.endTime = null;
  emit('search');
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <VRow class="filter-row" density="compact">
    <VCol cols="12" lg="3" md="4" sm="6">
      <VTextField
        v-model="model.title"
        clearable
        density="compact"
        :label="$t('page.operlog.columns.title')"
        :placeholder="$t('page.operlog.search.title')"
        prepend-inner-icon="mdi-view-dashboard-outline"
      />
    </VCol>

    <VCol cols="12" lg="3" md="4" sm="6">
      <VTextField
        v-model="model.operName"
        clearable
        density="compact"
        :label="$t('page.operlog.columns.operName')"
        :placeholder="$t('page.operlog.search.operName')"
        prepend-inner-icon="mdi-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.businessType"
        clearable
        density="compact"
        item-title="label"
        item-value="value"
        :items="businessTypes"
        :label="$t('page.operlog.columns.businessType')"
        :placeholder="$t('page.operlog.search.businessType')"
        prepend-inner-icon="mdi-tag-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        density="compact"
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.operlog.columns.status')"
        :placeholder="$t('page.operlog.search.status')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>

    <VCol cols="12" lg="4" md="4" sm="6">
      <DateRangeField v-model:begin="model.beginTime" v-model:end="model.endTime" />
    </VCol>

    <VCol class="filter-actions flex items-center justify-end gap-2" cols="12" lg="6">
      <VBtn prepend-icon="mdi-refresh" size="small" variant="text" @click="handleReset">
        {{ $t('common.reset') }}
      </VBtn>
      <VBtn color="primary" prepend-icon="mdi-magnify" size="small" @click="handleSearch">
        {{ $t('common.search') }}
      </VBtn>
    </VCol>
  </VRow>
</template>
