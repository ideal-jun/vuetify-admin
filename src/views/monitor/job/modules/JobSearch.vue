<script setup lang="ts">
import { computed, toRaw } from 'vue';

import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'JobSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.MonitorJob.SearchModel>('model', { required: true });

const jobGroupOptions = computed<CommonType.Option<string>[]>(() => [
  { label: $t('page.job.groups.default'), value: 'DEFAULT' },
  { label: $t('page.job.groups.system'), value: 'SYSTEM' },
]);

const statusOptions = computed<CommonType.Option<Api.MonitorJob.JobStatus>[]>(() => [
  { label: $t('page.job.status.normal'), value: '0' },
  { label: $t('page.job.status.paused'), value: '1' },
]);

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

function handleReset() {
  resetModel();
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <SearchPanel @reset="handleReset" @search="handleSearch">
    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.jobName"
        clearable
        :label="$t('page.job.search.jobName')"
        :placeholder="$t('page.job.search.jobNamePlaceholder')"
        prepend-inner-icon="mdi-calendar-clock-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.jobGroup"
        clearable
        item-title="label"
        item-value="value"
        :items="jobGroupOptions"
        :label="$t('page.job.search.jobGroup')"
        :placeholder="$t('page.job.search.jobGroupPlaceholder')"
        prepend-inner-icon="mdi-folder-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.job.search.status')"
        :placeholder="$t('page.job.search.statusPlaceholder')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>
  </SearchPanel>
</template>
