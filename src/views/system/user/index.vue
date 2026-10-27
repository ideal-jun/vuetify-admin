<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchBatchDeleteUser,
  fetchChangeUserStatus,
  fetchDeleteUser,
  fetchGetAllRoles,
  fetchGetUserList,
} from '@/service/api';

import UserDeptTree from './modules/UserDeptTree.vue';
import UserOperateDrawer from './modules/UserOperateDrawer.vue';
import UserResetPwdDialog from './modules/UserResetPwdDialog.vue';
import UserSearch from './modules/UserSearch.vue';

defineOptions({ name: 'SystemUser' });

type UserColumnKey =
  | 'userId'
  | 'userName'
  | 'nickName'
  | 'dept'
  | 'phonenumber'
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
    beginTime: null,
    endTime: null,
  };
}

const searchParams = ref<Api.SystemManage.UserSearchModel>(createDefaultSearchModel());

const selectedDeptId = ref<number | null>(null);

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

  const { beginTime, endTime, ...rest } = searchParams.value;

  const { data: userList, error } = await fetchGetUserList({
    ...rest,
    ...(selectedDeptId.value === null ? {} : { deptId: selectedDeptId.value }),
    ...(beginTime ? { 'params[beginTime]': beginTime } : {}),
    ...(endTime ? { 'params[endTime]': endTime } : {}),
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
const canResetPwd = computed(() => hasAuth(permissionCodes.userResetPwd));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } =
  useTableOperate<Api.SystemManage.User, number>(data, 'userId', loadUsers);

const resetPwdVisible = ref(false);
const resetPwdUser = ref<Api.SystemManage.User | null>(null);

function handleResetPwd(user: Api.SystemManage.User) {
  resetPwdUser.value = user;
  resetPwdVisible.value = true;
}

function handleResetPwdSubmitted() {
  refreshKey.value += 1;
}

const roleOptions = ref<CommonType.Option<number>[]>([]);

const baseHeaders = computed<UserTableHeader[]>(() => [
  {
    key: 'userId',
    title: $t('page.system.user.columns.userId'),
    width: 60,
    align: 'center',
    sortable: false,
  },
  {
    key: 'userName',
    title: $t('page.system.user.columns.userName'),
    width: 110,
    sortable: false,
  },
  {
    key: 'nickName',
    title: $t('page.system.user.columns.nickName'),
    width: 90,
    sortable: false,
  },
  {
    key: 'dept',
    title: $t('page.system.user.columns.dept'),
    width: 90,
    sortable: false,
  },
  {
    key: 'phonenumber',
    title: $t('page.system.user.columns.phonenumber'),
    width: 110,
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.system.user.columns.status'),
    width: 70,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.system.user.columns.createTime'),
    width: 140,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.system.user.columns.actions'),
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

async function handleStatusChange(user: Api.SystemManage.User, enabled: boolean) {
  const status = enabled ? '0' : '1';

  const { error } = await fetchChangeUserStatus({ userId: user.userId, status });

  if (error) {
    refreshKey.value += 1;

    return;
  }

  window.$message?.success($t('common.updateSuccess'));
  refreshKey.value += 1;
}

watch(selectedDeptId, () => {
  tableOptions.page = 1;
  checkedRowKeys.value = [];
  refreshKey.value += 1;
});

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
  <div class="flex min-h-[70vh] flex-col gap-4 lg:h-full lg:min-h-0 lg:flex-row">
    <div class="flex min-h-0 shrink-0 flex-col lg:w-[220px]">
      <UserDeptTree v-model:selected-dept-id="selectedDeptId" />
    </div>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
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

            <template #item.status="{ item }">
              <VSwitch
                color="primary"
                density="compact"
                :disabled="item.userId === 1"
                hide-details
                :model-value="item.status === '0'"
                @update:model-value="(value) => handleStatusChange(item, Boolean(value))"
              />
            </template>

            <template #item.createTime="{ item }">
              <span class="text-xs opacity-60">{{ item.createTime || '—' }}</span>
            </template>

            <template #item.actions="{ item }">
              <VBtn v-if="canEdit" size="small" variant="text" @click="handleEdit(item.userId)">
                {{ $t('common.edit') }}
              </VBtn>
              <VBtn
                v-if="canDelete"
                color="error"
                size="small"
                variant="text"
                @click="handleDelete(item)"
              >
                {{ $t('common.delete') }}
              </VBtn>

              <VMenu v-if="canResetPwd || canEdit" location="bottom end">
                <template #activator="{ props: activatorProps }">
                  <VBtn
                    v-bind="activatorProps"
                    :aria-label="$t('page.system.user.more')"
                    icon="mdi-dots-horizontal"
                    size="small"
                    variant="text"
                  />
                </template>

                <VList density="compact" min-width="170" nav>
                  <VListItem
                    v-if="canResetPwd"
                    :prepend-icon="'mdi-key-outline'"
                    :title="$t('page.system.user.resetPassword')"
                    @click="handleResetPwd(item)"
                  />
                  <VListItem
                    v-if="canEdit"
                    :prepend-icon="'mdi-account-key-outline'"
                    :title="$t('page.system.user.assignRole')"
                    @click="handleEdit(item.userId)"
                  />
                </VList>
              </VMenu>
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
          <UserResetPwdDialog
            v-model:visible="resetPwdVisible"
            :user="resetPwdUser"
            @submitted="handleResetPwdSubmitted"
          />

          <UserOperateDrawer
            v-model:visible="drawerVisible"
            :operate-type="operateType"
            :role-options="roleOptions"
            :row-data="editingData"
            @submitted="handleSubmitted"
          />
        </template>
      </TablePageLayout>
    </div>
  </div>
</template>
