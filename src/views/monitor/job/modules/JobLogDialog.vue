<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import { useTableData } from '@/hooks/common/table';
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

const { job } = defineProps<Props>();

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

const checkedLogIds = ref<number[]>([]);

const {
  data: logs,
  total,
  loading,
  tableOptions,
  refresh,
  search,
} = useTableData<Api.MonitorJob.JobLog>({
  fetchData: (page) => fetchGetJobLogList({ ...searchParams.value, ...page }),
  enabled: () => visible.value,
  onBeforeLoad: () => {
    checkedLogIds.value = [];
  },
});

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

interface JobLogTableRow extends Api.MonitorJob.JobLog {
  jobGroupLabel: string;
  statusLabel: string;
  createTimeLabel: string;
}

/** The rows with their display labels derived once per page load instead of per render */
const displayRows = computed<JobLogTableRow[]>(() =>
  logs.value.map((log) => ({
    ...log,
    jobGroupLabel: groupLabel(log.jobGroup),
    statusLabel: statusLabel(log.status),
    createTimeLabel: formatDateTime(log.createTime),
  })),
);

function resetSearch() {
  const { jobName, jobGroup } = job ?? {};

  searchParams.value = {
    ...createDefaultSearchModel(),
    jobName: jobName ?? null,
    jobGroup: jobGroup ?? null,
  };
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
      refresh();
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
      refresh();
    },
  });
}

watch([visible, () => job], ([isVisible]) => {
  if (!isVisible) {
    return;
  }

  tableOptions.page = 1;
  resetSearch();
  search();
});
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
          <VForm @submit.prevent="search">
            <VRow density="compact">
              <VCol cols="12" lg="2" md="4" sm="6">
                <VTextField
                  v-model="searchParams.jobName"
                  clearable
                  :label="$t('page.job.log.search.jobName')"
                  :placeholder="$t('page.job.log.search.jobNamePlaceholder')"
                />
              </VCol>
              <VCol cols="12" lg="2" md="4" sm="6">
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
              <VCol cols="12" lg="2" md="4" sm="6">
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
              <VCol cols="12" lg="4" md="8" sm="12">
                <DateRangeField
                  v-model:begin="searchParams.beginTime"
                  v-model:end="searchParams.endTime"
                />
              </VCol>
              <VCol class="flex items-end justify-end gap-2" cols="12">
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

        <VBtn prepend-icon="mdi-refresh" variant="text" @click="search">
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
        :items="displayRows"
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
          <VChip size="x-small" variant="tonal">{{ item.jobGroupLabel }}</VChip>
        </template>

        <template #item.invokeTarget="{ item }">
          <VCode class="text-xs">{{ item.invokeTarget }}</VCode>
        </template>

        <template #item.jobMessage="{ item }">
          <span class="text-xs">{{ item.jobMessage || '—' }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip :color="item.status === '0' ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.statusLabel }}
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
          <span class="text-xs opacity-60">{{ item.createTimeLabel }}</span>
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
