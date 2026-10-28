<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { enableStatusRecord, permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableData, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchBatchDeletePost, fetchDeletePost, fetchGetPostList } from '@/service/api/system-post';

import PostOperateDrawer from './modules/PostOperateDrawer.vue';
import PostSearch from './modules/PostSearch.vue';

defineOptions({ name: 'SystemPost' });

type PostColumnKey = 'postCode' | 'postName' | 'postSort' | 'status' | 'createTime' | 'actions';

interface PostTableHeader {
  key: PostColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.SystemManage.PostSearchModel {
  return {
    postCode: null,
    postName: null,
    status: null,
  };
}

const searchParams = ref<Api.SystemManage.PostSearchModel>(createDefaultSearchModel());

const checkedRowKeys = shallowRef<number[]>([]);

const {
  data,
  total,
  loading,
  tableOptions,
  load: loadPosts,
  refresh,
  search,
} = useTableData<Api.SystemManage.Post>({
  fetchData: (page) => fetchGetPostList({ ...searchParams.value, ...page }),
  onBeforeLoad: () => {
    checkedRowKeys.value = [];
  },
});

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.postAdd));
const canEdit = computed(() => hasAuth(permissionCodes.postEdit));
const canDelete = computed(() => hasAuth(permissionCodes.postDelete));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit } = useTableOperate<
  Api.SystemManage.Post,
  number
>(data, 'postId', loadPosts, { checkedRowKeys });

const baseHeaders = computed<PostTableHeader[]>(() => [
  {
    key: 'postCode',
    title: $t('page.post.columns.postCode'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'postName',
    title: $t('page.post.columns.postName'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'postSort',
    title: $t('page.post.columns.postSort'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.post.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.post.columns.createTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.post.columns.actions'),
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

function handleSubmitted() {
  if (operateType.value === 'add') {
    search();

    return;
  }

  refresh();
}

function reloadAfterRemove(removedCount: number) {
  if (tableOptions.page > 1 && data.value.length <= removedCount) {
    tableOptions.page -= 1;
  }

  refresh();
}

function handleDelete(post: Api.SystemManage.Post) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeletePost(post.postId);

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
    content: $t('page.post.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchBatchDeletePost(ids);

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
  <TablePageLayout :title="$t('page.post.listTitle')">
    <template #search>
      <PostSearch v-model:model="searchParams" @search="search" />
    </template>

    <template #actions>
      <TableHeaderOperation
        :can-batch-delete="canDelete"
        :loading="loading"
        :show-add="canAdd"
        :show-batch-delete="checkedRowKeys.length > 0"
        @add="handleAdd"
        @batch-delete="handleBatchDelete"
        @refresh="refresh"
      >
        <template #prefix>
          <VChip v-if="checkedRowKeys.length > 0" color="primary" size="small" variant="tonal">
            {{ $t('page.post.selectedCount', { count: checkedRowKeys.length }) }}
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
        item-value="postId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.post.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.postCode="{ item }">
          <VCode class="text-xs">{{ item.postCode }}</VCode>
        </template>

        <template #item.postName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <VIcon icon="mdi-badge-account-outline" size="18" />
            </VAvatar>
            <span class="font-500">{{ item.postName }}</span>
          </div>
        </template>

        <template #item.postSort="{ item }">
          <span class="text-xs opacity-60">{{ item.postSort }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip
            v-if="item.status"
            :color="item.status === '0' ? 'success' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ $t(enableStatusRecord[item.status]) }}
          </VChip>
          <span v-else class="opacity-40">—</span>
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
            @click="handleEdit(item.postId)"
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
            <VIcon class="opacity-20" icon="mdi-badge-account-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.post.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <PostOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
