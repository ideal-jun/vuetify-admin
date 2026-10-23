<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import TableColumnSetting from '@/components/advanced/TableColumnSetting.vue';
import TableHeaderOperation from '@/components/advanced/TableHeaderOperation.vue';
import TablePageLayout from '@/components/advanced/TablePageLayout.vue';
import { permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import type { TableColumnCheck } from '@/hooks/common/table';
import { getColumnChecks } from '@/hooks/common/table';
import { $t } from '@/locales';
import { useMenuStore } from '@/store/modules/menu';
import type { MenuTableRow } from '@/store/modules/menu';

import MenuOperateDrawer from './modules/MenuOperateDrawer.vue';
import MenuSearch from './modules/MenuSearch.vue';

defineOptions({ name: 'SystemMenu' });

type MenuColumnKey = 'name' | 'path' | 'permission' | 'type' | 'sort' | 'status' | 'actions';

interface MenuTableHeader {
  key: MenuColumnKey;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
}

const depthClassList = ['pl-0', 'pl-8', 'pl-16', 'pl-24', 'pl-32'];

const menuStore = useMenuStore();
const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.menuAdd));
const canEdit = computed(() => hasAuth(permissionCodes.menuEdit));
const canDelete = computed(() => hasAuth(permissionCodes.menuDelete));

const searchParams = ref<Api.Menu.SearchModel>({
  title: null,
  path: null,
  status: null,
});

const appliedSearch = ref<Api.Menu.SearchModel>({ ...searchParams.value });

const checkedRowKeys = ref<string[]>([]);

const drawerVisible = ref(false);

const operateType = ref<'add' | 'edit'>('add');

const editingId = ref<string | null>(null);

const addParentId = ref('');

const addDefaultType = ref<UnionKey.MenuType>('menu');

const collapsedIds = ref<string[]>([]);

const menuRowMap = computed(() => new Map(menuStore.flatMenus.map((item) => [item.id, item])));

const menuParentIds = computed(
  () => new Set(menuStore.flatMenus.map((item) => item.parentId).filter(Boolean)),
);

const collapsedSet = computed(() => new Set(collapsedIds.value));

function hasChildren(id: string) {
  return menuParentIds.value.has(id);
}

function isRowVisible(row: MenuTableRow) {
  let parentId = row.parentId;

  while (parentId) {
    if (collapsedSet.value.has(parentId)) {
      return false;
    }

    parentId = menuRowMap.value.get(parentId)?.parentId ?? null;
  }

  return true;
}

const filteredMenus = computed(() => {
  const title = appliedSearch.value.title?.trim().toLowerCase() ?? '';
  const path = appliedSearch.value.path?.trim().toLowerCase() ?? '';
  const status = appliedSearch.value.status;
  const hasFilter = Boolean(title || path || status);

  if (!hasFilter) {
    return menuStore.flatMenus.filter((item) => isRowVisible(item));
  }

  const matchedIds = new Set<string>();

  for (const item of menuStore.flatMenus) {
    const matched =
      (!title || item.title.toLowerCase().includes(title)) &&
      (!path || item.path.toLowerCase().includes(path)) &&
      (!status || item.status === status);

    if (!matched) {
      continue;
    }

    matchedIds.add(item.id);

    let parentId = item.parentId;

    while (parentId) {
      matchedIds.add(parentId);
      parentId = menuRowMap.value.get(parentId)?.parentId ?? null;
    }
  }

  return menuStore.flatMenus.filter((item) => matchedIds.has(item.id) && isRowVisible(item));
});

const editingData = computed<MenuTableRow | null>(() => {
  if (!editingId.value) {
    return null;
  }

  return menuStore.flatMenus.find((item) => item.id === editingId.value) ?? null;
});

const baseHeaders = computed<MenuTableHeader[]>(() => [
  {
    key: 'name',
    title: $t('page.system.menu.columns.name'),
    minWidth: 220,
    sortable: false,
  },
  {
    key: 'path',
    title: $t('page.system.menu.columns.path'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'permission',
    title: $t('page.system.menu.columns.permission'),
    minWidth: 180,
    sortable: false,
  },
  {
    key: 'type',
    title: $t('page.system.menu.columns.type'),
    width: 100,
    align: 'center',
    sortable: false,
  },
  {
    key: 'sort',
    title: $t('page.system.menu.columns.sort'),
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
    key: 'actions',
    title: $t('page.system.menu.columns.actions'),
    width: 200,
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

function getDepthClass(depth: number) {
  return depthClassList[Math.min(depth, depthClassList.length - 1)];
}

function toggleExpand(id: string) {
  collapsedIds.value = collapsedIds.value.includes(id)
    ? collapsedIds.value.filter((item) => item !== id)
    : [...collapsedIds.value, id];
}

function openCreate(parentId = '', type: UnionKey.MenuType = 'menu') {
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
  editingId.value = row.id;
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

function handleToggleStatus(row: MenuTableRow) {
  menuStore.toggleStatus(row.id);
}

function handleDelete(row: MenuTableRow) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      menuStore.removeMenu(row.id);
      checkedRowKeys.value = checkedRowKeys.value.filter((id) => id !== row.id);
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
    onPositiveClick: () => {
      for (const id of ids) {
        menuStore.removeMenu(id);
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
        item-value="id"
        :items="filteredMenus"
        :items-per-page="-1"
        :loading="menuStore.isLoading"
        :no-data-text="$t('page.system.menu.empty')"
        show-select
      >
        <template #item.name="{ item }">
          <div class="flex items-center gap-2" :class="getDepthClass(item.depth)">
            <VBtn
              v-if="hasChildren(item.id)"
              :aria-label="
                collapsedIds.includes(item.id)
                  ? $t('page.system.menu.expand')
                  : $t('page.system.menu.collapse')
              "
              density="compact"
              :icon="collapsedIds.includes(item.id) ? 'mdi-chevron-right' : 'mdi-chevron-down'"
              size="x-small"
              variant="text"
              @click.stop="toggleExpand(item.id)"
            />
            <span v-else class="inline-block w-7" />

            <VIcon v-if="item.icon" class="opacity-60" :icon="item.icon" size="18" />
            <VIcon
              v-else-if="item.type === 'button'"
              class="opacity-40"
              icon="mdi-gesture-tap-button"
              size="18"
            />
            <span v-else class="inline-block w-[18px]" />

            <span class="font-500">{{ item.title }}</span>
          </div>
        </template>

        <template #item.path="{ item }">
          <VCode class="text-xs">{{ item.path || '—' }}</VCode>
        </template>

        <template #item.permission="{ item }">
          <VCode v-if="item.type === 'button'" class="text-xs">{{ item.permission }}</VCode>
          <span v-else class="opacity-40">—</span>
        </template>

        <template #item.type="{ item }">
          <VChip
            :color="
              item.type === 'directory' ? 'info' : item.type === 'button' ? 'warning' : 'primary'
            "
            size="small"
            variant="tonal"
          >
            {{
              item.type === 'directory'
                ? $t('page.system.menu.type.directory')
                : item.type === 'button'
                  ? $t('page.system.menu.type.button')
                  : $t('page.system.menu.type.menu')
            }}
          </VChip>
        </template>

        <template #item.sort="{ item }">
          <span class="text-xs opacity-60">{{ item.sort }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="item.status === 'enabled' ? 'success' : 'default'"
            size="small"
            variant="tonal"
          >
            {{
              item.status === 'enabled'
                ? $t('page.system.menu.status.enabled')
                : $t('page.system.menu.status.disabled')
            }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="canAdd && item.type !== 'button'"
            :aria-label="
              item.type === 'directory'
                ? $t('page.system.menu.addChild')
                : $t('page.system.menu.addButton')
            "
            icon="mdi-plus"
            size="small"
            variant="text"
            @click="openCreate(item.id, item.type === 'directory' ? 'menu' : 'button')"
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
              item.status === 'enabled'
                ? $t('page.system.menu.status.disabled')
                : $t('page.system.menu.status.enabled')
            "
            :icon="item.status === 'enabled' ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
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
