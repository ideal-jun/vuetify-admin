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
  fetchBatchDeleteNotice,
  fetchDeleteNotice,
  fetchGetNoticeList,
} from '@/service/api/system-notice';

import NoticeOperateDrawer from './modules/NoticeOperateDrawer.vue';
import NoticeSearch from './modules/NoticeSearch.vue';

defineOptions({ name: 'SystemNotice' });

type NoticeColumnKey =
  | 'noticeTitle'
  | 'noticeType'
  | 'status'
  | 'createBy'
  | 'createTime'
  | 'actions';

interface NoticeTableHeader {
  key: NoticeColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.SystemManage.NoticeSearchModel {
  return {
    noticeTitle: null,
    createBy: null,
    noticeType: null,
    beginTime: null,
    endTime: null,
  };
}

const searchParams = ref<Api.SystemManage.NoticeSearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
});

const data = ref<Api.SystemManage.Notice[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshKey = ref(0);

let requestSequence = 0;

/** Build the backend query params, the date range uses the Spring "params[...]" convention */
function buildSearchParams(): Api.SystemManage.NoticeSearchParams {
  const { beginTime, endTime, ...rest } = searchParams.value;

  return {
    ...rest,
    pageNum: tableOptions.page,
    pageSize: tableOptions.itemsPerPage,
    ...(beginTime ? { 'params[beginTime]': beginTime } : {}),
    ...(endTime ? { 'params[endTime]': endTime } : {}),
  };
}

async function loadNotices() {
  const sequence = ++requestSequence;

  loading.value = true;

  const { data: noticeList, error } = await fetchGetNoticeList(buildSearchParams());

  if (sequence !== requestSequence) {
    return;
  }

  loading.value = false;

  if (error) {
    data.value = [];
    total.value = 0;

    return;
  }

  data.value = noticeList.rows;
  total.value = noticeList.total;
}

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.noticeAdd));
const canEdit = computed(() => hasAuth(permissionCodes.noticeEdit));
const canDelete = computed(() => hasAuth(permissionCodes.noticeDelete));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } =
  useTableOperate<Api.SystemManage.Notice, number>(data, 'noticeId', loadNotices);

const noticeTypeMap = computed<Record<Api.SystemManage.NoticeType, string>>(() => ({
  '1': $t('page.notice.type.notice'),
  '2': $t('page.notice.type.announcement'),
}));

const noticeStatusMap = computed<Record<Api.SystemManage.NoticeStatus, string>>(() => ({
  '0': $t('page.notice.status.normal'),
  '1': $t('page.notice.status.closed'),
}));

const baseHeaders = computed<NoticeTableHeader[]>(() => [
  {
    key: 'noticeTitle',
    title: $t('page.notice.columns.noticeTitle'),
    minWidth: 240,
    sortable: false,
  },
  {
    key: 'noticeType',
    title: $t('page.notice.columns.noticeType'),
    width: 120,
    align: 'center',
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.notice.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createBy',
    title: $t('page.notice.columns.createBy'),
    width: 120,
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.notice.columns.createTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.notice.columns.actions'),
    width: 120,
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

watch(
  () => [tableOptions.page, tableOptions.itemsPerPage, refreshKey.value],
  () => {
    checkedRowKeys.value = [];
    void loadNotices();
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

function handleDelete(notice: Api.SystemManage.Notice) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteNotice(notice.noticeId);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      reloadAfterRemove(1);
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
    content: $t('page.notice.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchBatchDeleteNotice(ids);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      reloadAfterRemove(ids.length);
    },
  });
}
</script>

<template>
  <TablePageLayout :title="$t('page.notice.listTitle')">
    <template #search>
      <NoticeSearch v-model:model="searchParams" @search="handleSearch" />
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
            {{ $t('page.notice.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

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
        item-value="noticeId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.notice.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.noticeTitle="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <VIcon icon="mdi-bullhorn-outline" size="18" />
            </VAvatar>
            <span class="font-500">{{ item.noticeTitle }}</span>
          </div>
        </template>

        <template #item.noticeType="{ item }">
          <VChip
            :color="item.noticeType === '1' ? 'primary' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ noticeTypeMap[item.noticeType] }}
          </VChip>
        </template>

        <template #item.status="{ item }">
          <VChip :color="item.status === '0' ? 'success' : 'default'" size="small" variant="tonal">
            {{ noticeStatusMap[item.status] }}
          </VChip>
        </template>

        <template #item.createBy="{ item }">
          <span class="text-xs">{{ item.createBy || '—' }}</span>
        </template>

        <template #item.createTime="{ item }">
          <span class="text-xs opacity-60">{{ item.createTime || '—' }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canEdit"
            :aria-label="$t('common.edit')"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            @click="handleEdit(item.noticeId)"
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
            <VIcon class="opacity-20" icon="mdi-bullhorn-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.notice.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <NoticeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
