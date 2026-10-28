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
import { fetchBatchDeleteRole, fetchDeleteRole, fetchGetRoleList } from '@/service/api';

import RoleOperateDrawer from './modules/RoleOperateDrawer.vue';
import RoleSearch from './modules/RoleSearch.vue';

defineOptions({ name: 'SystemRole' });

type RoleColumnKey = 'roleName' | 'roleKey' | 'roleSort' | 'status' | 'createTime' | 'actions';

interface RoleTableHeader {
  key: RoleColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.SystemManage.RoleSearchModel {
  return {
    roleName: null,
    roleKey: null,
    status: null,
  };
}

const searchParams = ref<Api.SystemManage.RoleSearchModel>(createDefaultSearchModel());

const checkedRowKeys = shallowRef<number[]>([]);

const {
  data,
  total,
  loading,
  tableOptions,
  load: loadRoles,
  refresh,
  search,
} = useTableData<Api.SystemManage.Role>({
  fetchData: (page) => fetchGetRoleList({ ...searchParams.value, ...page }),
  onBeforeLoad: () => {
    checkedRowKeys.value = [];
  },
});

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.roleAdd));
const canEdit = computed(() => hasAuth(permissionCodes.roleEdit));
const canDelete = computed(() => hasAuth(permissionCodes.roleDelete));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit } = useTableOperate<
  Api.SystemManage.Role,
  number
>(data, 'roleId', loadRoles, { checkedRowKeys });

const baseHeaders = computed<RoleTableHeader[]>(() => [
  {
    key: 'roleName',
    title: $t('page.system.role.columns.roleName'),
    minWidth: 170,
    sortable: false,
  },
  {
    key: 'roleKey',
    title: $t('page.system.role.columns.roleKey'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'roleSort',
    title: $t('page.system.role.columns.roleSort'),
    width: 90,
    align: 'center',
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.system.role.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.system.role.columns.createTime'),
    width: 170,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.system.role.columns.actions'),
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

const tableHeight = computed(() => (total.value === 0 ? '100%' : 'calc(100% - 62px)'));

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

function handleDelete(role: Api.SystemManage.Role) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteRole(role.roleId);

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
    content: $t('page.system.role.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchBatchDeleteRole(ids);

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
  <TablePageLayout :title="$t('page.system.role.listTitle')">
    <template #search>
      <RoleSearch v-model:model="searchParams" @search="search" />
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
            {{ $t('page.system.role.selectedCount', { count: checkedRowKeys.length }) }}
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
        :height="tableHeight"
        :hide-default-footer="total === 0"
        hover
        item-value="roleId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.system.role.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.roleName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <VIcon icon="mdi-shield-account-outline" size="18" />
            </VAvatar>
            <span class="font-500">{{ item.roleName }}</span>
          </div>
        </template>

        <template #item.roleKey="{ item }">
          <VCode class="text-xs">{{ item.roleKey }}</VCode>
        </template>

        <template #item.roleSort="{ item }">
          <span class="text-xs opacity-60">{{ item.roleSort }}</span>
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
            @click="handleEdit(item.roleId)"
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
            <VIcon class="opacity-20" icon="mdi-shield-search" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.system.role.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
