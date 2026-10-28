<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks, useTableData, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchDeleteGenTable,
  fetchGenCode,
  fetchGetGenTableList,
  fetchSynchGenDb,
} from '@/service/api/tool-gen';

import GenEditDialog from './modules/GenEditDialog.vue';
import GenImportDialog from './modules/GenImportDialog.vue';
import GenPreviewDialog from './modules/GenPreviewDialog.vue';
import GenSearch from './modules/GenSearch.vue';

defineOptions({ name: 'ToolGen' });

type GenColumnKey =
  | 'tableName'
  | 'tableComment'
  | 'className'
  | 'tplCategory'
  | 'tplWebType'
  | 'createTime'
  | 'updateTime'
  | 'actions';

interface GenTableHeader {
  key: GenColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.ToolGen.GenTableSearchModel {
  return {
    tableName: null,
    tableComment: null,
  };
}

const searchParams = ref<Api.ToolGen.GenTableSearchModel>(createDefaultSearchModel());

const checkedRowKeys = shallowRef<number[]>([]);

const {
  data,
  total,
  loading,
  tableOptions,
  load: loadGenTables,
  refresh,
  search,
} = useTableData<Api.ToolGen.GenTable>({
  fetchData: (page) => fetchGetGenTableList({ ...searchParams.value, ...page }),
  onBeforeLoad: () => {
    checkedRowKeys.value = [];
  },
});

const importVisible = ref(false);
const previewVisible = ref(false);
const previewTableId = ref<number | null>(null);
const previewTableName = ref<string | null>(null);

const { hasAuth } = useAuth();

const canImport = computed(() => hasAuth(permissionCodes.genImport));
const canEdit = computed(() => hasAuth(permissionCodes.genEdit));
const canDelete = computed(() => hasAuth(permissionCodes.genDelete));
const canPreview = computed(() => hasAuth(permissionCodes.genPreview));
const canCode = computed(() => hasAuth(permissionCodes.genCode));

const { drawerVisible, editingData, handleEdit } = useTableOperate<Api.ToolGen.GenTable, number>(
  data,
  'tableId',
  loadGenTables,
  { checkedRowKeys },
);

function templateLabel(value: Api.ToolGen.TplCategory | null | undefined) {
  if (value === 'crud') {
    return $t('page.gen.templates.crud');
  }

  if (value === 'tree') {
    return $t('page.gen.templates.tree');
  }

  if (value === 'sub') {
    return $t('page.gen.templates.sub');
  }

  return value ?? '—';
}

function webTypeLabel(value: Api.ToolGen.TplWebType | null | undefined) {
  if (value === 'element-ui') {
    return $t('page.gen.webTypes.elementUi');
  }

  if (value === 'element-plus') {
    return $t('page.gen.webTypes.elementPlus');
  }

  if (value === 'element-plus-typescript') {
    return $t('page.gen.webTypes.elementPlusTypescript');
  }

  return value ?? '—';
}

interface GenTableRow extends Api.ToolGen.GenTable {
  templateLabel: string;
  webTypeLabel: string;
}

/** The rows with their display labels derived once per page load instead of per render */
const displayRows = computed<GenTableRow[]>(() =>
  data.value.map((table) => ({
    ...table,
    templateLabel: templateLabel(table.tplCategory),
    webTypeLabel: webTypeLabel(table.tplWebType),
  })),
);

const baseHeaders = computed<GenTableHeader[]>(() => [
  {
    key: 'tableName',
    title: $t('page.gen.columns.tableName'),
    minWidth: 200,
    sortable: false,
  },
  {
    key: 'tableComment',
    title: $t('page.gen.columns.tableComment'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'className',
    title: $t('page.gen.columns.className'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'tplCategory',
    title: $t('page.gen.columns.tplCategory'),
    width: 180,
    sortable: false,
  },
  {
    key: 'tplWebType',
    title: $t('page.gen.columns.tplWebType'),
    width: 200,
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.gen.columns.createTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'updateTime',
    title: $t('page.gen.columns.updateTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.gen.columns.actions'),
    width: 230,
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

function handleImported() {
  search();
}

function handleSaved() {
  refresh();
}

function reloadAfterRemove(removedCount: number) {
  if (tableOptions.page > 1 && data.value.length <= removedCount) {
    tableOptions.page -= 1;
  }

  refresh();
}

function openPreview(table: Api.ToolGen.GenTable) {
  previewTableId.value = table.tableId;
  previewTableName.value = table.tableName;
  previewVisible.value = true;
}

function handleDelete(table: Api.ToolGen.GenTable) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.gen.messages.deleteConfirm', { table: table.tableName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteGenTable([table.tableId]);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      reloadAfterRemove(1);
    },
  });
}

function handleBatchDelete() {
  const tableIds = [...checkedRowKeys.value];

  if (tableIds.length === 0) {
    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.gen.messages.batchDeleteConfirm', { count: tableIds.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteGenTable(tableIds);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      reloadAfterRemove(tableIds.length);
    },
  });
}

function handleSynchDb(table: Api.ToolGen.GenTable) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.gen.messages.syncConfirm', { table: table.tableName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchSynchGenDb(table.tableName);

      if (error) {
        return;
      }

      window.$message?.success($t('page.gen.messages.syncSuccess'));

      refresh();
    },
  });
}

function handleGenerate(table: Api.ToolGen.GenTable) {
  if (table.genType !== '1') {
    window.$message?.info($t('page.gen.messages.generateZipHint'));
    openPreview(table);

    return;
  }

  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.gen.messages.generateConfirm', { table: table.tableName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchGenCode(table.tableName);

      if (error) {
        return;
      }

      window.$message?.success($t('page.gen.messages.generateSuccess'));

      refresh();
    },
  });
}
</script>

<template>
  <TablePageLayout :title="$t('page.gen.listTitle')">
    <template #search>
      <GenSearch v-model:model="searchParams" @search="search" />
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
            {{ $t('page.gen.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>

          <VBtn
            v-if="canImport"
            color="info"
            prepend-icon="mdi-upload-outline"
            variant="outlined"
            @click="importVisible = true"
          >
            {{ $t('page.gen.actions.import') }}
          </VBtn>
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
        item-value="tableId"
        :items="displayRows"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.gen.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.tableName="{ item }">
          <div class="flex items-center gap-2.5">
            <VAvatar color="primary" size="32" variant="tonal">
              <VIcon icon="mdi-table-cog" size="18" />
            </VAvatar>
            <VCode class="text-xs">{{ item.tableName }}</VCode>
          </div>
        </template>

        <template #item.tableComment="{ item }">
          <span class="text-sm">{{ item.tableComment || '—' }}</span>
        </template>

        <template #item.className="{ item }">
          <VCode class="text-xs">{{ item.className || '—' }}</VCode>
        </template>

        <template #item.tplCategory="{ item }">
          <VChip color="primary" size="small" variant="tonal">
            {{ item.templateLabel }}
          </VChip>
        </template>

        <template #item.tplWebType="{ item }">
          <VChip size="small" variant="tonal">{{ item.webTypeLabel }}</VChip>
        </template>

        <template #item.createTime="{ item }">
          <span class="text-xs opacity-60">{{ item.createTime || '—' }}</span>
        </template>

        <template #item.updateTime="{ item }">
          <span class="text-xs opacity-60">{{ item.updateTime || '—' }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canPreview"
            :aria-label="$t('page.gen.actions.preview')"
            icon="mdi-eye-outline"
            size="small"
            variant="text"
            @click="openPreview(item)"
          />
          <VBtn
            v-if="canEdit"
            :aria-label="$t('page.gen.actions.edit')"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            @click="handleEdit(item.tableId)"
          />
          <VBtn
            v-if="canEdit"
            :aria-label="$t('page.gen.actions.sync')"
            icon="mdi-database-refresh-outline"
            size="small"
            variant="text"
            @click="handleSynchDb(item)"
          />
          <VBtn
            v-if="canCode"
            :aria-label="$t('page.gen.actions.generate')"
            icon="mdi-file-code-outline"
            size="small"
            variant="text"
            @click="handleGenerate(item)"
          />
          <VBtn
            v-if="canDelete"
            :aria-label="$t('page.gen.actions.delete')"
            color="error"
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            @click="handleDelete(item)"
          />
        </template>

        <template #no-data>
          <div class="py-12 text-center">
            <VIcon class="opacity-20" icon="mdi-table-cog" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.gen.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>
    </template>

    <template #append>
      <GenImportDialog v-model:visible="importVisible" @imported="handleImported" />

      <GenEditDialog
        v-model:visible="drawerVisible"
        :table-id="editingData?.tableId ?? null"
        @saved="handleSaved"
      />

      <GenPreviewDialog
        v-model:visible="previewVisible"
        :table-id="previewTableId"
        :table-name="previewTableName"
      />
    </template>
  </TablePageLayout>
</template>
