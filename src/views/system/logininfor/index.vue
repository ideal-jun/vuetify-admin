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
  fetchCleanLogininfors,
  fetchDeleteLogininfors,
  fetchGetLogininforList,
  fetchUnlockLogininfor,
} from '@/service/api/system-logininfor';

import LogininforSearch from './modules/LogininforSearch.vue';
import { logininforStatusRecord } from './modules/shared';

defineOptions({ name: 'SystemLogininfor' });

type LogininforColumnKey =
  | 'infoId'
  | 'userName'
  | 'ipaddr'
  | 'loginLocation'
  | 'browser'
  | 'os'
  | 'status'
  | 'msg'
  | 'accessTime'
  | 'actions';

interface LogininforTableHeader {
  key: LogininforColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

const { hasAuth } = useAuth();

const canDelete = computed(() => hasAuth(permissionCodes.logininforDelete));
const canUnlock = computed(() => hasAuth(permissionCodes.logininforUnlock));

const searchParams = ref<Api.SystemLogininfor.SearchModel>({
  userName: null,
  ipaddr: null,
  status: null,
  beginTime: null,
  endTime: null,
});

const checkedRowKeys = shallowRef<number[]>([]);

const { data, total, loading, tableOptions, refresh, search } =
  useTableData<Api.SystemLogininfor.Logininfor>({
    fetchData: (page) => fetchGetLogininforList({ ...searchParams.value, ...page }),
    onBeforeLoad: () => {
      checkedRowKeys.value = [];
    },
  });

const baseHeaders = computed<LogininforTableHeader[]>(() => [
  {
    key: 'infoId',
    title: $t('page.logininfor.columns.infoId'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'userName',
    title: $t('page.logininfor.columns.userName'),
    width: 130,
    sortable: false,
  },
  {
    key: 'ipaddr',
    title: $t('page.logininfor.columns.ipaddr'),
    width: 130,
    sortable: false,
  },
  {
    key: 'loginLocation',
    title: $t('page.logininfor.columns.loginLocation'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'browser',
    title: $t('page.logininfor.columns.browser'),
    width: 120,
    sortable: false,
  },
  {
    key: 'os',
    title: $t('page.logininfor.columns.os'),
    width: 120,
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.logininfor.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'msg',
    title: $t('page.logininfor.columns.msg'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'accessTime',
    title: $t('page.logininfor.columns.accessTime'),
    width: 170,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.logininfor.columns.actions'),
    width: 100,
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

async function handleUnlock(row: Api.SystemLogininfor.Logininfor) {
  const userName = row.userName || '';

  if (!userName) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.logininfor.confirmUnlock', { userName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchUnlockLogininfor(userName);

      if (error) {
        return;
      }

      window.$message?.success($t('page.logininfor.unlockSuccess', { userName }));
    },
  });
}

function handleBatchDelete() {
  const ids = [...checkedRowKeys.value];

  if (ids.length === 0) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.logininfor.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteLogininfors(ids);

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
    content: $t('page.logininfor.confirmClean'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchCleanLogininfors();

      if (error) {
        return;
      }

      window.$message?.success($t('page.logininfor.cleanSuccess'));

      refresh();
    },
  });
}
</script>

<template>
  <TablePageLayout :title="$t('page.logininfor.title')">
    <template #search>
      <VCard class="app-panel shrink-0" variant="flat">
        <div class="p-4">
          <LogininforSearch v-model:model="searchParams" @search="search" />
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
            {{ $t('page.logininfor.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

        <VBtn
          v-if="canDelete"
          color="error"
          prepend-icon="mdi-delete-sweep-outline"
          variant="outlined"
          @click="handleClean"
        >
          {{ $t('page.logininfor.clean') }}
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
        item-value="infoId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.logininfor.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.infoId="{ item }">
          <span class="text-xs">{{ item.infoId }}</span>
        </template>

        <template #item.userName="{ item }">
          <span class="text-sm font-500">{{ item.userName || '—' }}</span>
        </template>

        <template #item.ipaddr="{ item }">
          <span class="text-xs opacity-70">{{ item.ipaddr || '—' }}</span>
        </template>

        <template #item.loginLocation="{ item }">
          <span class="text-xs">{{ item.loginLocation || '—' }}</span>
        </template>

        <template #item.browser="{ item }">
          <span class="text-xs">{{ item.browser || '—' }}</span>
        </template>

        <template #item.os="{ item }">
          <span class="text-xs">{{ item.os || '—' }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip :color="item.status === '0' ? 'success' : 'error'" size="small" variant="tonal">
            {{ $t(logininforStatusRecord[item.status]) }}
          </VChip>
        </template>

        <template #item.msg="{ item }">
          <span class="text-xs opacity-60">{{ item.msg || '—' }}</span>
        </template>

        <template #item.accessTime="{ item }">
          <span class="text-xs opacity-60">{{ item.accessTime || '—' }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canUnlock && item.status === '1'"
            :aria-label="$t('page.logininfor.unlock')"
            color="primary"
            icon="mdi-lock-open-variant-outline"
            size="small"
            variant="text"
            @click="handleUnlock(item)"
          />
        </template>

        <template #no-data>
          <div class="py-12 text-center">
            <VIcon class="opacity-20" icon="mdi-login-variant" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.logininfor.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>
  </TablePageLayout>
</template>
