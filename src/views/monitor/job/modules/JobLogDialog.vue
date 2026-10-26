<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import { $t } from '@/locales';
import {
  fetchCleanJobLogs,
  fetchDeleteJobLogs,
  fetchGetJobLogList,
} from '@/service/api/monitor-job';

import { formatDateTime } from './job-format';

defineOptions({ name: 'JobLogDialog' });

interface Props {
  /** The job opened from the list, null means all jobs */
  job?: Api.MonitorJob.Job | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', { required: true });

const { hasAuth } = useAuth();

const canDelete = computed(() => hasAuth(permissionCodes.jobDelete));

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.MonitorJob.JobLogSearchModel {
  return {
    jobName: null,
    jobGroup: null,
    status: null,
    beginTime: null,
    endTime: null,
  };
}

const searchParams = ref<Api.MonitorJob.JobLogSearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
});

const logs = ref<Api.MonitorJob.JobLog[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshKey = ref(0);
const checkedLogIds = ref<number[]>([]);

const jobGroupOptions = computed<CommonType.Option<string>[]>(() => [
  { label: $t('page.job.groups.default'), value: 'DEFAULT' },
  { label: $t('page.job.groups.system'), value: 'SYSTEM' },
]);

const statusOptions = computed<CommonType.Option<Api.MonitorJob.JobStatus>[]>(() => [
  { label: $t('page.job.log.status.success'), value: '0' },
  { label: $t('page.job.log.status.fail'), value: '1' },
]);

const headers = computed(() => [
  { key: 'jobLogId', title: $t('page.job.log.columns.jobLogId'), width: 90, sortable: false },
  { key: 'jobName', title: $t('page.job.log.columns.jobName'), minWidth: 140, sortable: false },
  { key: 'jobGroup', title: $t('page.job.log.columns.jobGroup'), width: 110, sortable: false },
  {
    key: 'invokeTarget',
    title: $t('page.job.log.columns.invokeTarget'),
    minWidth: 200,
    sortable: false,
  },
  {
    key: 'jobMessage',
    title: $t('page.job.log.columns.jobMessage'),
    minWidth: 160,
    sortable: false,
  },
  { key: 'status', title: $t('page.job.log.columns.status'), width: 110, sortable: false },
  {
    key: 'exceptionInfo',
    title: $t('page.job.log.columns.exceptionInfo'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.job.log.columns.createTime'),
    width: 180,
    sortable: false,
  },
]);

function groupLabel(jobGroup: string) {
  return jobGroupOptions.value.find((option) => option.value === jobGroup)?.label ?? jobGroup;
}

function statusLabel(status: Api.MonitorJob.JobStatus) {
  return status === '0' ? $t('page.job.log.status.success') : $t('page.job.log.status.fail');
}

async function loadLogs() {
  loading.value = true;

  const { data: logList, error } = await fetchGetJobLogList({
    ...searchParams.value,
    pageNum: tableOptions.page,
    pageSize: tableOptions.itemsPerPage,
  });

  loading.value = false;

  if (error) {
    logs.value = [];
    total.value = 0;

    return;
  }

  logs.value = logList.rows;
  total.value = logList.total;
}

function resetSearch() {
  const { jobName, jobGroup } = props.job ?? {};

  searchParams.value = {
    ...createDefaultSearchModel(),
    jobName: jobName ?? null,
    jobGroup: jobGroup ?? null,
  };
}

function handleSearch() {
  tableOptions.page = 1;
  refreshKey.value += 1;
}

function handleDelete() {
  const jobLogIds = [...checkedLogIds.value];

  if (jobLogIds.length === 0) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.job.log.deleteConfirm', { count: jobLogIds.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteJobLogs(jobLogIds);

      if (error) {
        return;
      }

      window.$message?.success($t('page.job.log.deleteSuccess'));
      checkedLogIds.value = [];
      refreshKey.value += 1;
    },
  });
}

function handleClean() {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.job.log.cleanConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchCleanJobLogs();

      if (error) {
        return;
      }

      window.$message?.success($t('page.job.log.cleanSuccess'));
      checkedLogIds.value = [];
      refreshKey.value += 1;
    },
  });
}

watch(
  () => [tableOptions.page, tableOptions.itemsPerPage, refreshKey.value],
  () => {
    if (visible.value) {
      checkedLogIds.value = [];
      void loadLogs();
    }
  },
  { immediate: true },
);

watch(visible, (value) => {
  if (value) {
    tableOptions.page = 1;
    resetSearch();
    refreshKey.value += 1;
  }
});

watch(
  () => props.job,
  () => {
    if (visible.value) {
      tableOptions.page = 1;
      resetSearch();
      refreshKey.value += 1;
    }
  },
);
</script>

<template>
  <VDialog v-model="visible" max-width="1200" scrollable>
    <VCard rounded="xl">
      <VCardTitle class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-600">{{ $t('page.job.log.title') }}</div>
          <div class="mt-1 truncate text-xs opacity-60">
            {{
              job
                ? $t('page.job.log.subtitle', { jobName: job.jobName })
                : $t('page.job.log.allJobs')
            }}
          </div>
        </div>

        <VBtn
          :aria-label="$t('page.job.log.close')"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="visible = false"
        />
      </VCardTitle>

      <VDivider />

      <VCardText class="py-4">
        <VDefaultsProvider
          :defaults="{
            VTextField: { density: 'compact', color: 'primary' },
            VSelect: { density: 'compact', color: 'primary' },
          }"
        >
          <VForm @submit.prevent="handleSearch">
            <VRow density="compact">
              <VCol cols="12" md="3" sm="6">
                <VTextField
                  v-model="searchParams.jobName"
                  clearable
                  :label="$t('page.job.log.search.jobName')"
                  :placeholder="$t('page.job.log.search.jobNamePlaceholder')"
                />
              </VCol>
              <VCol cols="12" md="2" sm="6">
                <VSelect
                  v-model="searchParams.jobGroup"
                  clearable
                  item-title="label"
                  item-value="value"
                  :items="jobGroupOptions"
                  :label="$t('page.job.log.search.jobGroup')"
                  :placeholder="$t('page.job.log.search.jobGroupPlaceholder')"
                />
              </VCol>
              <VCol cols="12" md="2" sm="6">
                <VSelect
                  v-model="searchParams.status"
                  clearable
                  item-title="label"
                  item-value="value"
                  :items="statusOptions"
                  :label="$t('page.job.log.search.status')"
                  :placeholder="$t('page.job.log.search.statusPlaceholder')"
                />
              </VCol>
              <VCol cols="12" md="2" sm="6">
                <VTextField
                  v-model="searchParams.beginTime"
                  clearable
                  :label="$t('page.job.log.search.beginTime')"
                  type="date"
                />
              </VCol>
              <VCol cols="12" md="2" sm="6">
                <VTextField
                  v-model="searchParams.endTime"
                  clearable
                  :label="$t('page.job.log.search.endTime')"
                  type="date"
                />
              </VCol>
              <VCol class="flex items-end justify-end gap-2" cols="12" md="1">
                <VBtn icon="mdi-magnify" size="small" type="submit" variant="text" />
              </VCol>
            </VRow>
          </VForm>
        </VDefaultsProvider>
      </VCardText>

      <VDivider />

      <VCardText class="flex flex-wrap items-center justify-end gap-2 py-2">
        <VBtn
          v-if="canDelete"
          color="error"
          :disabled="checkedLogIds.length === 0"
          prepend-icon="mdi-delete-outline"
          variant="outlined"
          @click="handleDelete"
        >
          {{ $t('page.job.log.deleteSelected') }}
        </VBtn>

        <VBtn
          v-if="canDelete"
          color="warning"
          prepend-icon="mdi-delete-sweep-outline"
          variant="outlined"
          @click="handleClean"
        >
          {{ $t('page.job.log.clean') }}
        </VBtn>

        <VBtn prepend-icon="mdi-refresh" variant="text" @click="handleSearch">
          {{ $t('common.refresh') }}
        </VBtn>
      </VCardText>

      <VDataTableServer
        v-model="checkedLogIds"
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        class="mx-4 min-h-0"
        density="comfortable"
        fixed-header
        :headers="headers"
        :hide-default-footer="total === 0"
        hover
        item-value="jobLogId"
        :items="logs"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.job.log.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.jobLogId="{ item }">
          <span class="text-xs opacity-60">{{ item.jobLogId }}</span>
        </template>

        <template #item.jobName="{ item }">
          <span class="font-500">{{ item.jobName }}</span>
        </template>

        <template #item.jobGroup="{ item }">
          <VChip size="x-small" variant="tonal">{{ groupLabel(item.jobGroup) }}</VChip>
        </template>

        <template #item.invokeTarget="{ item }">
          <VCode class="text-xs">{{ item.invokeTarget }}</VCode>
        </template>

        <template #item.jobMessage="{ item }">
          <span class="text-xs">{{ item.jobMessage || '—' }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip :color="item.status === '0' ? 'success' : 'error'" size="small" variant="tonal">
            {{ statusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.exceptionInfo="{ item }">
          <span
            class="block max-w-[260px] truncate text-xs opacity-70"
            :title="item.exceptionInfo ?? ''"
          >
            {{ item.exceptionInfo || '—' }}
          </span>
        </template>

        <template #item.createTime="{ item }">
          <span class="text-xs opacity-60">{{ formatDateTime(item.createTime) }}</span>
        </template>

        <template #no-data>
          <div class="py-10 text-center">
            <VIcon class="opacity-20" icon="mdi-text-box-search-outline" size="48" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.job.log.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>

      <VCardActions class="justify-end">
        <VBtn variant="text" @click="visible = false">{{ $t('page.job.log.close') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
