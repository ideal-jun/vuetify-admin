<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { enableStatusRecord, menuTypeRecord, permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks } from '@/hooks/common/table';
import { $t } from '@/locales';
import { useMenuStore } from '@/store/modules/menu';
import type { MenuTableRow } from '@/store/modules/menu';
import { translateRuoYiIcon } from '@/utils/icon';

import MenuOperateDrawer from './modules/MenuOperateDrawer.vue';
import MenuSearch from './modules/MenuSearch.vue';

defineOptions({ name: 'SystemMenu' });

type MenuColumnKey =
  | 'menuName'
  | 'menuType'
  | 'orderNum'
  | 'path'
  | 'component'
  | 'perms'
  | 'icon'
  | 'status'
  | 'createTime'
  | 'actions';

interface MenuTableHeader {
  key: MenuColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  fixed?: boolean | 'start' | 'end';
}

const depthClassList = ['pl-0', 'pl-8', 'pl-16', 'pl-24', 'pl-32'];

const menuStore = useMenuStore();

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.menuAdd));
const canEdit = computed(() => hasAuth(permissionCodes.menuEdit));
const canDelete = computed(() => hasAuth(permissionCodes.menuDelete));

const searchParams = ref<Api.Menu.SearchModel>({
  menuName: null,
  status: null,
});

const appliedSearch = ref<Api.Menu.SearchModel>({ ...searchParams.value });

const checkedRowKeys = ref<number[]>([]);

const drawerVisible = ref(false);

const operateType = ref<'add' | 'edit'>('add');

const editingId = ref<number | null>(null);

const addParentId = ref(0);

const addDefaultType = ref<Api.RuoYi.MenuType>('C');

const collapsedIds = ref<number[]>([]);

const menuRowMap = computed(() => new Map(menuStore.flatMenus.map((item) => [item.menuId, item])));

const menuParentIds = computed(
  () =>
    new Set(menuStore.flatMenus.map((item) => item.parentId).filter((parentId) => parentId !== 0)),
);

const collapsedSet = computed(() => new Set(collapsedIds.value));

function hasChildren(menuId: number) {
  return menuParentIds.value.has(menuId);
}

function isRowVisible(row: MenuTableRow) {
  let parentId = row.parentId;

  while (parentId) {
    if (collapsedSet.value.has(parentId)) {
      return false;
    }

    parentId = menuRowMap.value.get(parentId)?.parentId ?? 0;
  }

  return true;
}

const filteredMenus = computed(() => {
  const menuName = appliedSearch.value.menuName?.trim().toLowerCase() ?? '';
  const status = appliedSearch.value.status;
  const hasFilter = Boolean(menuName || status);

  if (!hasFilter) {
    return menuStore.flatMenus.filter((item) => isRowVisible(item));
  }

  const matchedIds = new Set<number>();

  for (const item of menuStore.flatMenus) {
    const matched =
      (!menuName || item.menuName.toLowerCase().includes(menuName)) &&
      (!status || item.status === status);

    if (!matched) {
      continue;
    }

    matchedIds.add(item.menuId);

    let parentId = item.parentId;

    while (parentId) {
      matchedIds.add(parentId);
      parentId = menuRowMap.value.get(parentId)?.parentId ?? 0;
    }
  }

  return menuStore.flatMenus.filter((item) => matchedIds.has(item.menuId) && isRowVisible(item));
});

const editingData = computed<MenuTableRow | null>(() => {
  if (editingId.value === null) {
    return null;
  }

  return menuStore.flatMenus.find((item) => item.menuId === editingId.value) ?? null;
});

const baseHeaders = computed<MenuTableHeader[]>(() => [
  {
    key: 'menuName',
    title: $t('page.system.menu.columns.menuName'),
    minWidth: 220,
    sortable: false,
  },
  {
    key: 'menuType',
    title: $t('page.system.menu.columns.menuType'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'orderNum',
    title: $t('page.system.menu.columns.orderNum'),
    width: 90,
    align: 'center',
    sortable: false,
  },
  {
    key: 'path',
    title: $t('page.system.menu.columns.path'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'component',
    title: $t('page.system.menu.columns.component'),
    minWidth: 200,
    sortable: false,
  },
  {
    key: 'perms',
    title: $t('page.system.menu.columns.perms'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'icon',
    title: $t('page.system.menu.columns.icon'),
    width: 90,
    align: 'center',
    sortable: false,
  },
  {
    key: 'status',
    title: $t('page.system.menu.columns.status'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'createTime',
    title: $t('page.system.menu.columns.createTime'),
    width: 170,
    sortable: false,
  },
  {
    key: 'actions',
    title: $t('page.system.menu.columns.actions'),
    width: 200,
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

function getDepthClass(depth: number) {
  return depthClassList[Math.min(depth, depthClassList.length - 1)];
}

function toggleExpand(menuId: number) {
  collapsedIds.value = collapsedIds.value.includes(menuId)
    ? collapsedIds.value.filter((item) => item !== menuId)
    : [...collapsedIds.value, menuId];
}

function openCreate(parentId = 0, type: Api.RuoYi.MenuType = 'C') {
  if (parentId) {
    collapsedIds.value = collapsedIds.value.filter((id) => id !== parentId);
  }

  operateType.value = 'add';
  editingId.value = null;
  addParentId.value = parentId;
  addDefaultType.value = type;
  drawerVisible.value = true;
}

function openEdit(row: MenuTableRow) {
  operateType.value = 'edit';
  editingId.value = row.menuId;
  drawerVisible.value = true;
}

function handleSubmitted() {
  checkedRowKeys.value = [];
}

function handleSearch() {
  appliedSearch.value = { ...searchParams.value };
  checkedRowKeys.value = [];
  collapsedIds.value = [];
}

async function handleRefresh() {
  checkedRowKeys.value = [];
  collapsedIds.value = [];
  await menuStore.reloadMenus();
}

async function handleToggleStatus(row: MenuTableRow) {
  await menuStore.toggleStatus(row.menuId);
}

function handleDelete(row: MenuTableRow) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const success = await menuStore.removeMenu(row.menuId);

      if (!success) {
        return;
      }

      checkedRowKeys.value = checkedRowKeys.value.filter((id) => id !== row.menuId);
      window.$message?.success($t('common.deleteSuccess'));
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
    content: $t('page.system.menu.confirmBatchDelete', { count: ids.length }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      for (const menuId of ids) {
        await menuStore.removeMenu(menuId);
      }

      checkedRowKeys.value = [];
      window.$message?.success($t('common.deleteSuccess'));
    },
  });
}

onMounted(() => {
  void menuStore.loadMenus();
});
</script>

<template>
  <TablePageLayout :title="$t('page.system.menu.listTitle')">
    <template #search>
      <MenuSearch v-model:model="searchParams" @search="handleSearch" />
    </template>

    <template #actions>
      <TableHeaderOperation
        :can-batch-delete="canDelete"
        :loading="menuStore.isLoading"
        :show-add="canAdd"
        :show-batch-delete="checkedRowKeys.length > 0"
        @add="openCreate()"
        @batch-delete="handleBatchDelete"
        @refresh="handleRefresh"
      >
        <template #prefix>
          <VChip v-if="checkedRowKeys.length > 0" color="primary" size="small" variant="tonal">
            {{ $t('page.system.menu.selectedCount', { count: checkedRowKeys.length }) }}
          </VChip>
        </template>

        <TableColumnSetting :checks="columnChecks" @update:checks="updateColumnChecks" />
      </TableHeaderOperation>
    </template>

    <template #table>
      <VDataTable
        v-model="checkedRowKeys"
        class="min-h-0 flex-1"
        density="comfortable"
        disable-sort
        fixed-header
        :headers="visibleHeaders"
        hide-default-footer
        hover
        item-value="menuId"
        :items="filteredMenus"
        :items-per-page="-1"
        :loading="menuStore.isLoading"
        :no-data-text="$t('page.system.menu.empty')"
        show-select
      >
        <template #item.menuName="{ item }">
          <div class="flex items-center gap-2" :class="getDepthClass(item.depth)">
            <VBtn
              v-if="hasChildren(item.menuId)"
              :aria-label="
                collapsedIds.includes(item.menuId)
                  ? $t('page.system.menu.expand')
                  : $t('page.system.menu.collapse')
              "
              density="compact"
              :icon="collapsedIds.includes(item.menuId) ? 'mdi-chevron-right' : 'mdi-chevron-down'"
              size="x-small"
              variant="text"
              @click.stop="toggleExpand(item.menuId)"
            />
            <span v-else class="inline-block w-7" />

            <VIcon
              v-if="item.icon"
              class="opacity-60"
              :icon="translateRuoYiIcon(item.icon)"
              size="18"
            />
            <VIcon
              v-else-if="item.menuType === 'F'"
              class="opacity-40"
              icon="mdi-gesture-tap-button"
              size="18"
            />
            <span v-else class="inline-block w-[18px]" />

            <span class="font-500">{{ item.menuName }}</span>
          </div>
        </template>

        <template #item.menuType="{ item }">
          <VChip
            :color="item.menuType === 'M' ? 'info' : item.menuType === 'F' ? 'warning' : 'primary'"
            size="small"
            variant="tonal"
          >
            {{ $t(menuTypeRecord[item.menuType]) }}
          </VChip>
        </template>

        <template #item.orderNum="{ item }">
          <span class="text-xs opacity-60">{{ item.orderNum }}</span>
        </template>

        <template #item.path="{ item }">
          <VCode class="text-xs">{{ item.path || '—' }}</VCode>
        </template>

        <template #item.component="{ item }">
          <VCode v-if="item.component" class="text-xs">{{ item.component }}</VCode>
          <span v-else class="opacity-40">—</span>
        </template>

        <template #item.perms="{ item }">
          <VCode v-if="item.perms" class="text-xs">{{ item.perms }}</VCode>
          <span v-else class="opacity-40">—</span>
        </template>

        <template #item.icon="{ item }">
          <VIcon
            v-if="item.icon"
            class="opacity-70"
            :icon="translateRuoYiIcon(item.icon)"
            size="18"
          />
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
            v-if="canAdd && item.menuType !== 'F'"
            :aria-label="
              item.menuType === 'M'
                ? $t('page.system.menu.addChild')
                : $t('page.system.menu.addButton')
            "
            icon="mdi-plus"
            size="small"
            variant="text"
            @click="openCreate(item.menuId, item.menuType === 'M' ? 'C' : 'F')"
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
            v-if="canEdit"
            :aria-label="
              item.status === '0'
                ? $t('page.system.common.status.disabled')
                : $t('page.system.common.status.normal')
            "
            :icon="item.status === '0' ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            size="small"
            variant="text"
            @click="handleToggleStatus(item)"
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
            <VIcon class="opacity-20" icon="mdi-file-tree-outline" size="52" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.system.menu.empty') }}</div>
          </div>
        </template>
      </VDataTable>
    </template>

    <template #append>
      <MenuOperateDrawer
        v-model:visible="drawerVisible"
        :default-type="addDefaultType"
        :operate-type="operateType"
        :parent-id="addParentId"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />
    </template>
  </TablePageLayout>
</template>
