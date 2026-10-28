<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableData } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchCleanOperlogs,
  fetchDeleteOperlogs,
  fetchGetOperlogList,
} from '@/service/api/system-operlog';

import OperlogDetailDialog from './modules/OperlogDetailDialog.vue';
import OperlogSearch from './modules/OperlogSearch.vue';
import { getBusinessTypeLabel, operlogStatusRecord } from './modules/shared';

defineOptions({ name: 'SystemOperlog' });

type OperlogColumnKey =
  | 'operId'
  | 'title'
  | 'businessType'
  | 'requestMethod'
  | 'operName'
  | 'operIp'
  | 'status'
  | 'operTime'
  | 'costTime'
  | 'actions';

interface OperlogTableHeader {
  key: OperlogColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

const { hasAuth } = useAuth();

const canDelete = computed(() => hasAuth(permissionCodes.operlogDelete));

const searchParams = ref<Api.SystemOperlog.SearchModel>({
  title: null,
  operName: null,
  businessType: null,
  status: null,
  beginTime: null,
  endTime: null,
});

const checkedRowKeys = shallowRef<number[]>([]);

const { data, total, loading, tableOptions, refresh, search } =
  useTableData<Api.SystemOperlog.Operlog>({
    fetchData: (page) => fetchGetOperlogList({ ...searchParams.value, ...page }),
    onBeforeLoad: () => {
      checkedRowKeys.value = [];
    },
  });

const detailVisible = ref(false);
const detailRow = ref<Api.SystemOperlog.Operlog | null>(null);

const baseHeaders = computed<OperlogTableHeader[]>(() => [
  {
    key: 'operId',
    title: $t('page.operlog.columns.operId'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'title',
    title: $t('page.operlog.columns.title'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'businessType',
    title: $t('page.operlog.columns.businessType'),
    width: 110,
    align: 'center',
    sortable: false,
  },
  {
    key: 'requestMethod',
    title: $t('page.operlog.columns.requestMethod'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'operName',
    title: $t('page.operlog.columns.operName'),
    width: 120,
    sortable: false,
  },
  {
    key: 'operIp',
    title: $t('page.operlog.columns.operIp'),
    width: 130,
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.operlog.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'operTime',
    title: $t('page.operlog.columns.operTime'),
    width: 170,
    sortable: false,
  },
  {
    key: 'costTime',
    title: $t('page.operlog.columns.costTime'),
    width: 110,
    align: 'center',
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.operlog.columns.actions'),
    width: 90,
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

interface OperlogTableRow extends Api.SystemOperlog.Operlog {
  businessTypeLabel: string;
}

/** The rows with their display labels derived once per page load instead of per render */
const displayRows = computed<OperlogTableRow[]>(() =>
  data.value.map((log) => ({
    ...log,
    businessTypeLabel: getBusinessTypeLabel(log.businessType),
  })),
);

function handleView(row: Api.SystemOperlog.Operlog) {
  detailRow.value = row;
  detailVisible.value = true;
}

function handleBatchDelete() {
  const ids = [...checkedRowKeys.value];

  if (ids.length === 0) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.operlog.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteOperlogs(ids);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      refresh();
    },
  });
}

function handleClean() {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.operlog.confirmClean'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchCleanOperlogs();

      if (error) {
        return;
      }

      window.$message?.success($t('page.operlog.cleanSuccess'));

      refresh();
    },
  });
}
</script>

<template>
  <TablePageLayout :title="$t('page.operlog.title')">
    <template #search>
      <VCard class="app-panel shrink-0" variant="flat">
        <div class="p-4">
          <OperlogSearch v-model:model="searchParams" @search="search" />
        </div>
      </VCard>
    </template>

    <template #actions>
      <TableHeaderOperation
        :can-batch-delete="canDelete"
        :loading="loading"
        :show-add="false"
        :show-batch-delete="checkedRowKeys.length > 0"
        @batch-delete="handleBatchDelete"
        @refresh="refresh"
      >
        <template #prefix>
          <VChip v-if="checkedRowKeys.length > 0" color="primary" size="small" variant="tonal">
            {{ $t('page.operlog.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

        <VBtn
          v-if="canDelete"
          color="error"
          prepend-icon="mdi-delete-sweep-outline"
          variant="outlined"
          @click="handleClean"
        >
          {{ $t('page.operlog.clean') }}
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
        item-value="operId"
        :items="displayRows"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.operlog.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.title="{ item }">
          <span class="text-sm">{{ item.title || '—' }}</span>
        </template>

        <template #item.businessType="{ item }">
          <VChip size="small" variant="tonal">
            {{ item.businessTypeLabel }}
          </VChip>
        </template>

        <template #item.requestMethod="{ item }">
          <VCode class="text-xs">{{ item.requestMethod || '—' }}</VCode>
        </template>

        <template #item.operName="{ item }">
          <span class="text-sm">{{ item.operName || '—' }}</span>
        </template>

        <template #item.operIp="{ item }">
          <span class="text-xs opacity-70">{{ item.operIp || '—' }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip :color="item.status === '0' ? 'success' : 'error'" size="small" variant="tonal">
            {{ $t(operlogStatusRecord[item.status]) }}
          </VChip>
        </template>

        <template #item.operTime="{ item }">
          <span class="text-xs opacity-60">{{ item.operTime || '—' }}</span>
        </template>

        <template #item.costTime="{ item }">
          <span class="text-xs opacity-60">
            {{ $t('page.operlog.costTimeUnit', { value: item.costTime ?? 0 }) }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            :aria-label="$t('page.operlog.detailAction')"
            icon="mdi-text-box-search-outline"
            size="small"
            variant="text"
            @click="handleView(item)"
          />
        </template>

        <template #no-data>
          <div class="py-12 text-center">
            <VIcon class="opacity-20" icon="mdi-clipboard-text-clock-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.operlog.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <OperlogDetailDialog v-model:visible="detailVisible" :row="detailRow" />
    </template>
  </TablePageLayout>
</template>
