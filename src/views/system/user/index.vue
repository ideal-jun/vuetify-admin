<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { enableStatusRecord, permissionCodes, userSexRecord } from '@/constants/business';
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
  | 'userName'
  | 'nickName'
  | 'dept'
  | 'phonenumber'
  | 'sex'
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
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.SystemManage.UserSearchModel {
  return {
    userName: null,
    phonenumber: null,
    status: null,
  };
}

const searchParams = ref<Api.SystemManage.UserSearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
});

const data = ref<Api.SystemManage.User[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshKey = ref(0);

let requestSequence = 0;

async function loadUsers() {
  const sequence = ++requestSequence;

  loading.value = true;

  const { data: userList, error } = await fetchGetUserList({
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

  data.value = userList.rows;
  total.value = userList.total;
}

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.userAdd));
const canEdit = computed(() => hasAuth(permissionCodes.userEdit));
const canDelete = computed(() => hasAuth(permissionCodes.userDelete));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } =
  useTableOperate<Api.SystemManage.User, number>(data, 'userId', loadUsers);

const roleOptions = ref<CommonType.Option<number>[]>([]);

const baseHeaders = computed<UserTableHeader[]>(() => [
  {
    key: 'userName',
    title: $t('page.system.user.columns.userName'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'nickName',
    title: $t('page.system.user.columns.nickName'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'dept',
    title: $t('page.system.user.columns.dept'),
    minWidth: 140,
    sortable: false,
  },
  {
    key: 'phonenumber',
    title: $t('page.system.user.columns.phonenumber'),
    minWidth: 150,
    sortable: false,
  },
  {
    key: 'sex',
    title: $t('page.system.user.columns.sex'),
    width: 90,
    align: 'center',
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.system.user.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.system.user.columns.createTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.system.user.columns.actions'),
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

async function loadRoles() {
  const { data: roleList, error } = await fetchGetAllRoles();

  if (error) {
    return;
  }

  roleOptions.value = roleList.map((role) => ({
    label: role.roleName,
    value: role.roleId,
  }));
}

watch(
  () => [tableOptions.page, tableOptions.itemsPerPage, refreshKey.value],
  () => {
    checkedRowKeys.value = [];
    void loadUsers();
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

function handleDelete(user: Api.SystemManage.User) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteUser(user.userId);

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
        class="min-h-0 flex-1"
        density="comfortable"
        fixed-header
        :headers="visibleHeaders"
        :hide-default-footer="total === 0"
        hover
        item-value="userId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.system.user.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.userName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <span class="text-xs font-700">
                {{ item.userName.slice(0, 1).toUpperCase() }}
              </span>
            </VAvatar>
            <span class="font-500">{{ item.userName }}</span>
          </div>
        </template>

        <template #item.nickName="{ item }">
          <span class="text-sm">{{ item.nickName || '—' }}</span>
        </template>

        <template #item.dept="{ item }">
          <span class="text-sm">{{ item.dept?.deptName || '—' }}</span>
        </template>

        <template #item.phonenumber="{ item }">
          <span class="text-xs">{{ item.phonenumber || '—' }}</span>
        </template>

        <template #item.sex="{ item }">
          <VChip
            v-if="item.sex"
            :color="item.sex === '0' ? 'primary' : item.sex === '1' ? 'error' : 'default'"
            size="small"
            variant="tonal"
          >
            {{ $t(userSexRecord[item.sex]) }}
          </VChip>
          <span v-else class="opacity-40">—</span>
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
            @click="handleEdit(item.userId)"
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
