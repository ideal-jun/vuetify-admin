<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { enableStatusRecord, permissionCodes, userGenderRecord } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetAllRoles,
  fetchGetUserList,
} from '@/service/api';

import UserOperateDrawer from './modules/UserOperateDrawer.vue';
import UserSearch from './modules/UserSearch.vue';

defineOptions({ name: 'SystemUser' });

type UserColumnKey =
  | 'index'
  | 'userName'
  | 'userGender'
  | 'contact'
  | 'userRoles'
  | 'status'
  | 'createTime'
  | 'actions';

interface UserTableHeader {
  key: UserColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
}

interface TableSortItem {
  key: string;
  order?: 'asc' | 'desc';
}

const roleColorMap: Record<string, string> = {
  R_SUPER: 'error',
  R_ADMIN: 'primary',
  R_USER: 'success',
  R_GUEST: 'info',
};

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.SystemManage.UserSearchModel {
  return {
    userName: null,
    userGender: null,
    nickName: null,
    userPhone: null,
    userEmail: null,
    status: null,
  };
}

const searchParams = ref<Api.SystemManage.UserSearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [] as TableSortItem[],
});

const data = ref<Api.SystemManage.User[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshKey = ref(0);

let requestSequence = 0;

async function loadUsers() {
  const sequence = ++requestSequence;
  const sort = tableOptions.sortBy[0];

  loading.value = true;

  const { data: userList, error } = await fetchGetUserList({
    ...searchParams.value,
    current: tableOptions.page,
    size: tableOptions.itemsPerPage,
    sortBy: sort?.key ?? null,
    sortOrder: sort?.order ?? null,
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

  data.value = userList.records;
  total.value = userList.total;
}

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.userAdd));
const canEdit = computed(() => hasAuth(permissionCodes.userEdit));
const canDelete = computed(() => hasAuth(permissionCodes.userDelete));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } =
  useTableOperate<Api.SystemManage.User, number>(data, 'id', loadUsers);

const roleOptions = ref<CommonType.Option<string>[]>([]);

const roleNameMap = computed<Record<string, string>>(() =>
  Object.fromEntries(roleOptions.value.map((role) => [role.value, role.label])),
);

const baseHeaders = computed<UserTableHeader[]>(() => [
  { key: 'index', title: $t('common.index'), width: 64, align: 'center', sortable: false },
  {
    key: 'userName',
    title: $t('page.system.user.columns.userName'),
    minWidth: 180,
    sortable: true,
  },
  {
    key: 'userGender',
    title: $t('page.system.user.columns.userGender'),
    width: 90,
    align: 'center',
    sortable: true,
  },
  {
    key: 'contact',
    title: $t('page.system.user.columns.contact'),
    minWidth: 220,
    sortable: false,
  },
  {
    key: 'userRoles',
    title: $t('page.system.user.columns.userRoles'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.system.user.columns.status'),
    width: 100,
    align: 'center',
    sortable: true,
  },
  {
    key: 'createTime',
    title: $t('page.system.user.columns.createTime'),
    width: 180,
    sortable: true,
  },
  {
    key: 'actions',
    title: $t('page.system.user.columns.actions'),
    width: 120,
    align: 'center',
    sortable: false,
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

function getRoleColor(roleCode: string) {
  return roleColorMap[roleCode] ?? 'default';
}

async function loadRoles() {
  const { data: roleList, error } = await fetchGetAllRoles();

  if (error) {
    return;
  }

  roleOptions.value = roleList.map((role) => ({
    label: role.roleName,
    value: role.roleCode,
  }));
}

watch(
  () => [tableOptions.page, tableOptions.itemsPerPage, tableOptions.sortBy, refreshKey.value],
  () => {
    checkedRowKeys.value = [];
    void loadUsers();
  },
  { deep: true, immediate: true },
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

function handleDelete(user: Api.SystemManage.User) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteUser(user.id);

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
    content: $t('page.system.user.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchBatchDeleteUser(ids);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      reloadAfterRemove(ids.length);
    },
  });
}

onMounted(() => {
  void loadRoles();
});
</script>

<template>
  <TablePageLayout :title="$t('page.system.user.listTitle')">
    <template #search>
      <UserSearch v-model:model="searchParams" @search="handleSearch" />
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
            {{ $t('page.system.user.selectedCount', { count: checkedRowKeys.length }) }}
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
        v-model:sort-by="tableOptions.sortBy"
        class="min-h-0 flex-1"
        density="comfortable"
        fixed-header
        :headers="visibleHeaders"
        :hide-default-footer="total === 0"
        hover
        item-value="id"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.system.user.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.index="{ index }">
          {{ (tableOptions.page - 1) * tableOptions.itemsPerPage + index + 1 }}
        </template>

        <template #item.userName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <span class="text-xs font-700">
                {{ item.userName.slice(0, 1).toUpperCase() }}
              </span>
            </VAvatar>
            <div class="min-w-0">
              <div class="font-500">{{ item.userName }}</div>
              <div class="text-[11px] opacity-50">{{ item.nickName || '—' }}</div>
            </div>
          </div>
        </template>

        <template #item.userGender="{ item }">
          <VChip
            v-if="item.userGender"
            :color="item.userGender === '1' ? 'primary' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ $t(userGenderRecord[item.userGender]) }}
          </VChip>
          <span v-else class="opacity-40">—</span>
        </template>

        <template #item.contact="{ item }">
          <div class="text-xs">{{ item.userEmail || '—' }}</div>
          <div class="mt-0.5 text-[11px] opacity-50">{{ item.userPhone || '—' }}</div>
        </template>

        <template #item.userRoles="{ item }">
          <div class="flex flex-wrap gap-1 py-1">
            <VChip
              v-for="role in item.userRoles"
              :key="role"
              :color="getRoleColor(role)"
              size="x-small"
              variant="tonal"
            >
              {{ roleNameMap[role] ?? role }}
            </VChip>
            <span v-if="item.userRoles.length === 0" class="opacity-40">—</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            v-if="item.status"
            :color="item.status === '1' ? 'success' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ $t(enableStatusRecord[item.status]) }}
          </VChip>
          <span v-else class="opacity-40">—</span>
        </template>

        <template #item.createTime="{ item }">
          <span class="text-xs opacity-60">{{ item.createTime }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canEdit"
            :aria-label="$t('common.edit')"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            @click="handleEdit(item.id)"
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
            <VIcon class="opacity-20" icon="mdi-account-search-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.system.user.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :role-options="roleOptions"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
