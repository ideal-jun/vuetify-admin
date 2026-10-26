<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchChangeJobStatus,
  fetchDeleteJobs,
  fetchGetJobList,
  fetchRunJob,
} from '@/service/api/monitor-job';

import { formatDateTime } from './modules/job-format';
import JobDetailDialog from './modules/JobDetailDialog.vue';
import JobLogDialog from './modules/JobLogDialog.vue';
import JobOperateDrawer from './modules/JobOperateDrawer.vue';
import JobSearch from './modules/JobSearch.vue';

defineOptions({ name: 'MonitorJob' });

type JobColumnKey =
  | 'jobId'
  | 'jobName'
  | 'jobGroup'
  | 'invokeTarget'
  | 'cronExpression'
  | 'status'
  | 'nextValidTime'
  | 'actions';

interface JobTableHeader {
  key: JobColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.MonitorJob.SearchModel {
  return {
    jobName: null,
    jobGroup: null,
    status: null,
  };
}

const searchParams = ref<Api.MonitorJob.SearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
});

const data = ref<Api.MonitorJob.Job[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshKey = ref(0);

const logDialogVisible = ref(false);
const logJob = ref<Api.MonitorJob.Job | null>(null);
const detailDialogVisible = ref(false);
const detailJobId = ref<number | null>(null);

let requestSequence = 0;

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.jobAdd));
const canEdit = computed(() => hasAuth(permissionCodes.jobEdit));
const canDelete = computed(() => hasAuth(permissionCodes.jobDelete));
const canChangeStatus = computed(() => hasAuth(permissionCodes.jobChangeStatus));

const jobGroupOptions = computed<CommonType.Option<string>[]>(() => [
  { label: $t('page.job.groups.default'), value: 'DEFAULT' },
  { label: $t('page.job.groups.system'), value: 'SYSTEM' },
]);

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } =
  useTableOperate<Api.MonitorJob.Job, number>(data, 'jobId', loadJobs);

const baseHeaders = computed<JobTableHeader[]>(() => [
  { key: 'jobId', title: $t('page.job.columns.jobId'), width: 90, sortable: false },
  {
    key: 'jobName',
    title: $t('page.job.columns.jobName'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'jobGroup',
    title: $t('page.job.columns.jobGroup'),
    width: 120,
    sortable: false,
  },
  {
    key: 'invokeTarget',
    title: $t('page.job.columns.invokeTarget'),
    minWidth: 220,
    sortable: false,
  },
  {
    key: 'cronExpression',
    title: $t('page.job.columns.cronExpression'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.job.columns.status'),
    width: 110,
    align: 'center',
    sortable: false,
  },
  {
    key: 'nextValidTime',
    title: $t('page.job.columns.nextValidTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.job.columns.actions'),
    width: 240,
    align: 'center',
    sortable: false,
    fixed: 'end',
  },
]);

const hiddenColumnKeys = ref<string[]>([]);

const columnChecks = computed<TableColumnCheck[]>(() =>
  getColumnChecks(baseHeaders.value).map((check) => ({
    ...check,
    checked: !hiddenColumnKeys.value.includes(check.key),
  })),
);

const visibleHeaders = computed(() =>
  baseHeaders.value.filter((header) => !hiddenColumnKeys.value.includes(header.key)),
);

function updateColumnChecks(checks: TableColumnCheck[]) {
  hiddenColumnKeys.value = checks.filter((check) => !check.checked).map((check) => check.key);
}

function groupLabel(jobGroup: string) {
  return jobGroupOptions.value.find((option) => option.value === jobGroup)?.label ?? jobGroup;
}

function statusLabel(status: Api.MonitorJob.JobStatus) {
  return status === '0' ? $t('page.job.status.normal') : $t('page.job.status.paused');
}

async function loadJobs() {
  const sequence = ++requestSequence;

  loading.value = true;

  const { data: jobList, error } = await fetchGetJobList({
    ...searchParams.value,
    pageNum: tableOptions.page,
    pageSize: tableOptions.itemsPerPage,
  });

  if (sequence !== requestSequence) {
    return;
  }

  loading.value = false;

  if (error) {
    data.value = [];
    total.value = 0;

    return;
  }

  data.value = jobList.rows;
  total.value = jobList.total;
}

watch(
  () => [tableOptions.page, tableOptions.itemsPerPage, refreshKey.value],
  () => {
    checkedRowKeys.value = [];
    void loadJobs();
  },
  { immediate: true },
);

function handleSearch() {
  tableOptions.page = 1;
  refreshKey.value += 1;
}

function handleRefresh() {
  refreshKey.value += 1;
}

function handleSubmitted() {
  if (operateType.value === 'add') {
    tableOptions.page = 1;
  }

  refreshKey.value += 1;
}

function reloadAfterRemove(removedCount: number) {
  if (tableOptions.page > 1 && data.value.length <= removedCount) {
    tableOptions.page -= 1;
  }

  refreshKey.value += 1;
}

function handleDelete(job: Api.MonitorJob.Job) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.job.actions.deleteConfirm', { jobName: job.jobName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteJobs([job.jobId]);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));
      reloadAfterRemove(1);
    },
  });
}

function handleBatchDelete() {
  const jobIds = [...checkedRowKeys.value];

  if (jobIds.length === 0) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.job.actions.batchDeleteConfirm', { count: jobIds.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteJobs(jobIds);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));
      reloadAfterRemove(jobIds.length);
    },
  });
}

function handleStatusChange(job: Api.MonitorJob.Job, nextStatus: Api.MonitorJob.JobStatus) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.job.actions.changeStatusConfirm', {
      jobName: job.jobName,
      status: statusLabel(nextStatus),
    }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchChangeJobStatus(job.jobId, nextStatus);

      if (error) {
        return;
      }

      window.$message?.success($t('page.job.actions.changeStatusSuccess'));
      refreshKey.value += 1;
    },
  });
}

function handleRun(job: Api.MonitorJob.Job) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.job.actions.runConfirm', { jobName: job.jobName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchRunJob(job.jobId, job.jobGroup);

      if (error) {
        return;
      }

      window.$message?.success($t('page.job.actions.runSuccess'));
    },
  });
}

function openLogs(job: Api.MonitorJob.Job | null = null) {
  logJob.value = job;
  logDialogVisible.value = true;
}

function openDetail(job: Api.MonitorJob.Job) {
  detailJobId.value = job.jobId;
  detailDialogVisible.value = true;
}
</script>

<template>
  <TablePageLayout :title="$t('page.job.listTitle')">
    <template #search>
      <JobSearch v-model:model="searchParams" @search="handleSearch" />
    </template>

    <template #actions>
      <TableHeaderOperation
        :can-batch-delete="canDelete"
        :loading="loading"
        :show-add="canAdd"
        :show-batch-delete="checkedRowKeys.length > 0"
        @add="handleAdd"
        @batch-delete="handleBatchDelete"
        @refresh="handleRefresh"
      >
        <template #prefix>
          <VChip v-if="checkedRowKeys.length > 0" color="primary" size="small" variant="tonal">
            {{ $t('page.job.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

        <VBtn prepend-icon="mdi-text-box-search-outline" variant="text" @click="openLogs()">
          {{ $t('page.job.log.title') }}
        </VBtn>

        <TableColumnSetting :checks="columnChecks" @update:checks="updateColumnChecks" />
      </TableHeaderOperation>
    </template>

    <template #table>
      <VDataTableServer
        v-model="checkedRowKeys"
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        class="min-h-0 flex-1"
        density="comfortable"
        fixed-header
        :headers="visibleHeaders"
        :hide-default-footer="total === 0"
        hover
        item-value="jobId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.job.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.jobId="{ item }">
          <span class="text-xs opacity-60">{{ item.jobId }}</span>
        </template>

        <template #item.jobName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <VIcon icon="mdi-calendar-clock-outline" size="18" />
            </VAvatar>
            <span class="font-500">{{ item.jobName }}</span>
          </div>
        </template>

        <template #item.jobGroup="{ item }">
          <VChip color="primary" size="small" variant="tonal">{{
            groupLabel(item.jobGroup)
          }}</VChip>
        </template>

        <template #item.invokeTarget="{ item }">
          <VCode class="text-xs">{{ item.invokeTarget }}</VCode>
        </template>

        <template #item.cronExpression="{ item }">
          <VCode class="text-xs">{{ item.cronExpression }}</VCode>
        </template>

        <template #item.status="{ item }">
          <VSwitch
            v-if="canChangeStatus"
            color="primary"
            density="compact"
            hide-details
            :model-value="item.status === '0'"
            @update:model-value="(value) => handleStatusChange(item, value ? '0' : '1')"
          />
          <VChip
            v-else
            :color="item.status === '0' ? 'success' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ statusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.nextValidTime="{ item }">
          <span class="text-xs opacity-60">{{ formatDateTime(item.nextValidTime) }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canChangeStatus"
            :aria-label="$t('page.job.actions.run')"
            icon="mdi-play-circle-outline"
            size="small"
            variant="text"
            @click="handleRun(item)"
          />
          <VBtn
            v-if="canEdit"
            :aria-label="$t('common.edit')"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            @click="handleEdit(item.jobId)"
          />
          <VBtn
            :aria-label="$t('page.job.actions.logs')"
            icon="mdi-text-box-search-outline"
            size="small"
            variant="text"
            @click="openLogs(item)"
          />
          <VBtn
            :aria-label="$t('page.job.actions.detail')"
            icon="mdi-information-outline"
            size="small"
            variant="text"
            @click="openDetail(item)"
          />
          <VBtn
            v-if="canDelete"
            :aria-label="$t('common.delete')"
            color="error"
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            @click="handleDelete(item)"
          />
        </template>

        <template #no-data>
          <div class="py-12 text-center">
            <VIcon class="opacity-20" icon="mdi-calendar-remove-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.job.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <JobOperateDrawer
        v-model:visible="drawerVisible"
        :job-group-options="jobGroupOptions"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />

      <JobLogDialog v-model:visible="logDialogVisible" :job="logJob" />

      <JobDetailDialog
        v-model:job-id="detailJobId"
        v-model:visible="detailDialogVisible"
        :job-group-options="jobGroupOptions"
      />
    </template>
  </TablePageLayout>
</template>
