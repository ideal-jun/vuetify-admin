<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref, shallowRef } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableData } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchForceLogout, fetchGetOnlineList } from '@/service/api/monitor-online';

import OnlineSearch from './modules/OnlineSearch.vue';

defineOptions({ name: 'MonitorOnline' });

type OnlineColumnKey =
  | 'tokenId'
  | 'userName'
  | 'deptName'
  | 'ipaddr'
  | 'loginLocation'
  | 'browser'
  | 'os'
  | 'loginTime'
  | 'actions';

interface OnlineTableHeader {
  key: OnlineColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.MonitorOnline.SearchModel {
  return {
    userName: null,
    ipaddr: null,
  };
}

const searchParams = ref<Api.MonitorOnline.SearchModel>(createDefaultSearchModel());

const checkedRowKeys = shallowRef<string[]>([]);

const { data, total, loading, tableOptions, refresh, search } =
  useTableData<Api.MonitorOnline.OnlineUser>({
    fetchData: (page) => fetchGetOnlineList({ ...searchParams.value, ...page }),
    onBeforeLoad: () => {
      checkedRowKeys.value = [];
    },
  });

const { hasAuth } = useAuth();

const canForceLogout = computed(() => hasAuth(permissionCodes.onlineForceLogout));

const baseHeaders = computed<OnlineTableHeader[]>(() => [
  {
    key: 'tokenId',
    title: $t('page.online.columns.tokenId'),
    minWidth: 220,
    sortable: false,
  },
  {
    key: 'userName',
    title: $t('page.online.columns.userName'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'deptName',
    title: $t('page.online.columns.deptName'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'ipaddr',
    title: $t('page.online.columns.ipaddr'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'loginLocation',
    title: $t('page.online.columns.loginLocation'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'browser',
    title: $t('page.online.columns.browser'),
    minWidth: 120,
    sortable: false,
  },
  {
    key: 'os',
    title: $t('page.online.columns.os'),
    minWidth: 120,
    sortable: false,
  },
  {
    key: 'loginTime',
    title: $t('page.online.columns.loginTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.online.columns.actions'),
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

function formatLoginTime(loginTime?: number | null) {
  return loginTime ? dayjs(loginTime).format('YYYY-MM-DD HH:mm:ss') : '—';
}

interface OnlineTableRow extends Api.MonitorOnline.OnlineUser {
  initial: string;
  loginTimeLabel: string;
}

/** The rows with their display labels derived once per page load instead of per render */
const displayRows = computed<OnlineTableRow[]>(() =>
  data.value.map((user) => ({
    ...user,
    initial: user.userName.slice(0, 1).toUpperCase(),
    loginTimeLabel: formatLoginTime(user.loginTime),
  })),
);

function handleColumnChecks(checks: TableColumnCheck[]) {
  updateColumnChecks(checks);
}

async function forceLogout(tokenId: string) {
  const { error } = await fetchForceLogout(tokenId);

  if (error) {
    return false;
  }

  window.$message?.success($t('page.online.forceLogoutSuccess'));

  return true;
}

function handleForceLogout(row: Api.MonitorOnline.OnlineUser) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.online.forceLogoutConfirm', { userName: row.userName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const success = await forceLogout(row.tokenId);

      if (success) {
        refresh();
      }
    },
  });
}

function handleBatchForceLogout() {
  const tokenIds = [...checkedRowKeys.value];

  if (tokenIds.length === 0) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.online.batchForceLogoutConfirm', { count: tokenIds.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      for (const tokenId of tokenIds) {
        const success = await forceLogout(tokenId);

        if (!success) {
          return;
        }
      }

      refresh();
    },
  });
}
</script>

<template>
  <TablePageLayout :title="$t('page.online.listTitle')">
    <template #search>
      <OnlineSearch v-model:model="searchParams" @search="search" />
    </template>

    <template #actions>
      <TableHeaderOperation
        :can-batch-delete="false"
        :loading="loading"
        :show-add="false"
        @refresh="refresh"
      >
        <template #prefix>
          <VChip v-if="checkedRowKeys.length > 0" color="primary" size="small" variant="tonal">
            {{ $t('page.online.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

        <VBtn
          v-if="canForceLogout"
          color="error"
          :disabled="checkedRowKeys.length === 0"
          prepend-icon="mdi-logout-variant"
          variant="outlined"
          @click="handleBatchForceLogout"
        >
          {{ $t('page.online.batchForceLogout') }}
        </VBtn>

        <TableColumnSetting :checks="columnChecks" @update:checks="handleColumnChecks" />
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
        item-value="tokenId"
        :items="displayRows"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.online.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.tokenId="{ item }">
          <VCode class="text-xs">{{ item.tokenId }}</VCode>
        </template>

        <template #item.userName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <span class="text-xs font-700">{{ item.initial }}</span>
            </VAvatar>
            <span class="font-500">{{ item.userName }}</span>
          </div>
        </template>

        <template #item.deptName="{ item }">
          <span class="text-sm">{{ item.deptName || '—' }}</span>
        </template>

        <template #item.ipaddr="{ item }">
          <span class="text-xs">{{ item.ipaddr || '—' }}</span>
        </template>

        <template #item.loginLocation="{ item }">
          <span class="text-sm">{{ item.loginLocation || '—' }}</span>
        </template>

        <template #item.browser="{ item }">
          <span class="text-xs">{{ item.browser || '—' }}</span>
        </template>

        <template #item.os="{ item }">
          <span class="text-xs">{{ item.os || '—' }}</span>
        </template>

        <template #item.loginTime="{ item }">
          <span class="text-xs opacity-60">{{ item.loginTimeLabel }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canForceLogout"
            :aria-label="$t('page.online.forceLogout')"
            color="error"
            icon="mdi-logout-variant"
            size="small"
            variant="text"
            @click="handleForceLogout(item)"
          />
        </template>

        <template #no-data>
          <div class="py-12 text-center">
            <VIcon class="opacity-20" icon="mdi-account-multiple-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.online.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>
  </TablePageLayout>
</template>
