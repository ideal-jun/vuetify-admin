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
  fetchBatchDeleteConfig,
  fetchDeleteConfig,
  fetchGetConfigList,
  fetchRefreshConfigCache,
} from '@/service/api/system-config';

import ConfigOperateDrawer from './modules/ConfigOperateDrawer.vue';
import ConfigSearch from './modules/ConfigSearch.vue';

defineOptions({ name: 'SystemConfig' });

type ConfigColumnKey =
  | 'configName'
  | 'configKey'
  | 'configValue'
  | 'configType'
  | 'remark'
  | 'createTime'
  | 'actions';

interface ConfigTableHeader {
  key: ConfigColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.SystemManage.ConfigSearchModel {
  return {
    configName: null,
    configKey: null,
    configType: null,
    beginTime: null,
    endTime: null,
  };
}

const searchParams = ref<Api.SystemManage.ConfigSearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
});

const data = ref<Api.SystemManage.Config[]>([]);
const total = ref(0);
const loading = ref(false);
const refreshKey = ref(0);

let requestSequence = 0;

/** Build the backend query params, the date range uses the Spring "params[...]" convention */
function buildSearchParams(): Api.SystemManage.ConfigSearchParams {
  const { beginTime, endTime, ...rest } = searchParams.value;

  return {
    ...rest,
    pageNum: tableOptions.page,
    pageSize: tableOptions.itemsPerPage,
    ...(beginTime ? { 'params[beginTime]': beginTime } : {}),
    ...(endTime ? { 'params[endTime]': endTime } : {}),
  };
}

async function loadConfigs() {
  const sequence = ++requestSequence;

  loading.value = true;

  const { data: configList, error } = await fetchGetConfigList(buildSearchParams());

  if (sequence !== requestSequence) {
    return;
  }

  loading.value = false;

  if (error) {
    data.value = [];
    total.value = 0;

    return;
  }

  data.value = configList.rows;
  total.value = configList.total;
}

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.configAdd));
const canEdit = computed(() => hasAuth(permissionCodes.configEdit));
const canDelete = computed(() => hasAuth(permissionCodes.configDelete));

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } =
  useTableOperate<Api.SystemManage.Config, number>(data, 'configId', loadConfigs);

const configTypeOptions = computed<CommonType.Option<Api.SystemManage.ConfigType>[]>(() => [
  { label: $t('page.config.type.yes'), value: 'Y' },
  { label: $t('page.config.type.no'), value: 'N' },
]);

const configTypeMap = computed(() =>
  Object.fromEntries(configTypeOptions.value.map((option) => [option.value, option.label])),
);

const baseHeaders = computed<ConfigTableHeader[]>(() => [
  {
    key: 'configName',
    title: $t('page.config.columns.configName'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'configKey',
    title: $t('page.config.columns.configKey'),
    minWidth: 200,
    sortable: false,
  },
  {
    key: 'configValue',
    title: $t('page.config.columns.configValue'),
    minWidth: 200,
    sortable: false,
  },
  {
    key: 'configType',
    title: $t('page.config.columns.configType'),
    width: 120,
    align: 'center',
    sortable: false,
  },
  {
    key: 'remark',
    title: $t('page.config.columns.remark'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.config.columns.createTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.config.columns.actions'),
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
    void loadConfigs();
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

function handleRefreshCache() {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.config.refreshCacheConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchRefreshConfigCache();

      if (error) {
        return;
      }

      window.$message?.success($t('page.config.refreshCacheSuccess'));
    },
  });
}

function reloadAfterRemove(removedCount: number) {
  if (tableOptions.page > 1 && data.value.length <= removedCount) {
    tableOptions.page -= 1;
  }

  refreshKey.value += 1;
}

function handleDelete(config: Api.SystemManage.Config) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteConfig(config.configId);

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
    content: $t('page.config.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchBatchDeleteConfig(ids);

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
  <TablePageLayout :title="$t('page.config.listTitle')">
    <template #search>
      <ConfigSearch v-model:model="searchParams" @search="handleSearch" />
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
            {{ $t('page.config.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

        <VBtn v-if="canDelete" prepend-icon="mdi-cached" variant="text" @click="handleRefreshCache">
          {{ $t('page.config.refreshCache') }}
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
        item-value="configId"
        :items="data"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.config.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.configName="{ item }">
          <span class="font-500">{{ item.configName }}</span>
        </template>

        <template #item.configKey="{ item }">
          <VCode class="text-xs">{{ item.configKey }}</VCode>
        </template>

        <template #item.configValue="{ item }">
          <span class="block max-w-[260px] truncate text-xs opacity-60" :title="item.configValue">
            {{ item.configValue || '—' }}
          </span>
        </template>

        <template #item.configType="{ item }">
          <VChip :color="item.configType === 'Y' ? 'info' : 'default'" size="small" variant="tonal">
            {{ configTypeMap[item.configType] }}
          </VChip>
        </template>

        <template #item.remark="{ item }">
          <span class="block max-w-[220px] truncate text-xs opacity-60" :title="item.remark ?? ''">
            {{ item.remark || '—' }}
          </span>
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
            @click="handleEdit(item.configId)"
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
            <VIcon class="opacity-20" icon="mdi-cog-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.config.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <ConfigOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
