<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { enableStatusRecord, permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteDept, fetchGetDeptList } from '@/service/api/system-dept';

import DeptOperateDrawer from './modules/DeptOperateDrawer.vue';
import DeptSearch from './modules/DeptSearch.vue';

defineOptions({ name: 'SystemDept' });

type DeptColumnKey = 'deptName' | 'orderNum' | 'status' | 'createTime' | 'actions';

interface DeptTableHeader {
  key: DeptColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

interface DeptRow extends Api.SystemManage.Dept {
  depth: number;
}

const depthClassList = ['pl-0', 'pl-8', 'pl-16', 'pl-24', 'pl-32'];

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.deptAdd));
const canEdit = computed(() => hasAuth(permissionCodes.deptEdit));
const canDelete = computed(() => hasAuth(permissionCodes.deptDelete));

const searchParams = ref<Api.SystemManage.DeptSearchModel>({
  deptName: null,
  status: null,
});

const appliedSearch = ref<Api.SystemManage.DeptSearchModel>({ ...searchParams.value });

const rawDepts = ref<Api.SystemManage.Dept[]>([]);
const loading = ref(false);
const refreshKey = ref(0);

const collapsedIds = ref<number[]>([]);

const drawerVisible = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const addParentId = ref(0);
const editingData = ref<Api.SystemManage.Dept | null>(null);

/** Build the department tree from the flat list returned by the backend */
const deptTree = computed<Api.SystemManage.Dept[]>(() => {
  const nodeMap = new Map<number, Api.SystemManage.Dept>();

  for (const dept of rawDepts.value) {
    nodeMap.set(dept.deptId, { ...dept, children: [] });
  }

  const roots: Api.SystemManage.Dept[] = [];

  for (const dept of nodeMap.values()) {
    const parent = dept.parentId ? nodeMap.get(dept.parentId) : undefined;

    if (parent) {
      parent.children = [...(parent.children ?? []), dept];
    } else {
      roots.push(dept);
    }
  }

  const sortTree = (items: Api.SystemManage.Dept[]) => {
    items.sort((first, second) => (first.orderNum ?? 0) - (second.orderNum ?? 0));

    for (const item of items) {
      if (item.children?.length) {
        sortTree(item.children);
      }
    }
  };

  sortTree(roots);

  return roots;
});

/** The flattened tree rows used by the table */
const deptRows = computed<DeptRow[]>(() => {
  const rows: DeptRow[] = [];

  const walk = (items: Api.SystemManage.Dept[], depth: number) => {
    for (const item of items) {
      rows.push({ ...item, depth });

      if (item.children?.length) {
        walk(item.children, depth + 1);
      }
    }
  };

  walk(deptTree.value, 0);

  return rows;
});

const parentIds = computed(
  () => new Set(rawDepts.value.map((dept) => dept.parentId).filter((parentId) => parentId !== 0)),
);

const deptMap = computed(() => new Map(rawDepts.value.map((dept) => [dept.deptId, dept])));

const collapsedSet = computed(() => new Set(collapsedIds.value));

function isRowVisible(row: DeptRow) {
  let parentId = row.parentId ?? 0;

  while (parentId) {
    if (collapsedSet.value.has(parentId)) {
      return false;
    }

    parentId = deptMap.value.get(parentId)?.parentId ?? 0;
  }

  return true;
}

const visibleRows = computed(() => deptRows.value.filter((row) => isRowVisible(row)));

function hasChildren(deptId: number) {
  return parentIds.value.has(deptId);
}

function getDepthClass(depth: number) {
  return depthClassList[Math.min(depth, depthClassList.length - 1)];
}

function toggleExpand(deptId: number) {
  collapsedIds.value = collapsedIds.value.includes(deptId)
    ? collapsedIds.value.filter((item) => item !== deptId)
    : [...collapsedIds.value, deptId];
}

const baseHeaders = computed<DeptTableHeader[]>(() => [
  {
    key: 'deptName',
    title: $t('page.dept.columns.deptName'),
    minWidth: 260,
    sortable: false,
  },
  {
    key: 'orderNum',
    title: $t('page.dept.columns.orderNum'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.dept.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.dept.columns.createTime'),
    width: 180,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.dept.columns.actions'),
    width: 160,
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

async function loadDepts() {
  loading.value = true;

  const { data, error } = await fetchGetDeptList(appliedSearch.value);

  loading.value = false;

  if (error) {
    rawDepts.value = [];

    return;
  }

  rawDepts.value = data;
}

watch(
  () => refreshKey.value,
  () => {
    void loadDepts();
  },
  { immediate: true },
);

function handleSearch() {
  appliedSearch.value = { ...searchParams.value };
  collapsedIds.value = [];
  refreshKey.value += 1;
}

function handleRefresh() {
  collapsedIds.value = [];
  refreshKey.value += 1;
}

function openCreate(parentId = 0) {
  if (parentId) {
    collapsedIds.value = collapsedIds.value.filter((id) => id !== parentId);
  }

  operateType.value = 'add';
  addParentId.value = parentId;
  editingData.value = null;
  drawerVisible.value = true;
}

function openEdit(row: DeptRow) {
  operateType.value = 'edit';
  editingData.value = row;
  drawerVisible.value = true;
}

function handleSubmitted() {
  refreshKey.value += 1;
}

function handleDelete(row: DeptRow) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteDept(row.deptId);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      refreshKey.value += 1;
    },
  });
}
</script>

<template>
  <TablePageLayout :title="$t('page.dept.listTitle')">
    <template #search>
      <DeptSearch v-model:model="searchParams" @search="handleSearch" />
    </template>

    <template #actions>
      <TableHeaderOperation
        :can-batch-delete="false"
        :loading="loading"
        :show-add="canAdd"
        @add="openCreate()"
        @refresh="handleRefresh"
      >
        <TableColumnSetting :checks="columnChecks" @update:checks="updateColumnChecks" />
      </TableHeaderOperation>
    </template>

    <template #table>
      <VDataTable
        class="min-h-0 flex-1"
        density="comfortable"
        disable-sort
        fixed-header
        :headers="visibleHeaders"
        hide-default-footer
        hover
        item-value="deptId"
        :items="visibleRows"
        :items-per-page="-1"
        :loading="loading"
        :no-data-text="$t('page.dept.empty')"
      >
        <template #item.deptName="{ item }">
          <div class="flex items-center gap-2" :class="getDepthClass(item.depth)">
            <VBtn
              v-if="hasChildren(item.deptId)"
              :aria-label="
                collapsedIds.includes(item.deptId)
                  ? $t('page.dept.expand')
                  : $t('page.dept.collapse')
              "
              density="compact"
              :icon="collapsedIds.includes(item.deptId) ? 'mdi-chevron-right' : 'mdi-chevron-down'"
              size="x-small"
              variant="text"
              @click.stop="toggleExpand(item.deptId)"
            />
            <span v-else class="inline-block w-7" />

            <VIcon class="opacity-60" icon="mdi-office-building-outline" size="18" />

            <span class="font-500">{{ item.deptName }}</span>
          </div>
        </template>

        <template #item.orderNum="{ item }">
          <span class="text-xs opacity-60">{{ item.orderNum }}</span>
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
            v-if="canAdd"
            :aria-label="$t('page.dept.addChild')"
            icon="mdi-plus"
            size="small"
            variant="text"
            @click="openCreate(item.deptId)"
          />
          <VBtn
            v-if="canEdit"
            :aria-label="$t('common.edit')"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            @click="openEdit(item)"
          />
          <VBtn
            v-if="canDelete && item.parentId !== 0"
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
            <VIcon class="opacity-20" icon="mdi-office-building-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.dept.empty') }}</div>
          </div>
        </template>
      </VDataTable>
    </template>

    <template #append>
      <DeptOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :parent-id="addParentId"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
