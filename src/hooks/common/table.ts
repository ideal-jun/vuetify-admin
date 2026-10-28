import { reactive, ref, shallowRef, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref, ShallowRef } from 'vue';

import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

import { useBoolean } from './boolean';

export interface TableColumnCheck {
  key: string;
  title: string;
  checked: boolean;
  visible: boolean;
}

/** One page request handed to a {@link useTableData} fetcher */
export interface TablePageRequest {
  /** The 1-based page number */
  pageNum: number;
  /** The rows per page */
  pageSize: number;
}

/** The paginated payload every table fetcher returns */
export interface TablePage<T> {
  rows: T[];
  total: number;
}

/** The table pagination state bound to the VDataTable server options */
export interface TableOptions {
  page: number;
  itemsPerPage: number;
}

export interface UseTableDataOptions<T> {
  /** Fetch one page for the current query, called whenever the pagination or search revision changes */
  fetchData: (request: TablePageRequest) => Promise<App.Service.FlatResponseData<TablePage<T>>>;
  /** The initial rows per page, defaults to 10 */
  pageSize?: number;
  /** Load the first page on setup, defaults to true */
  immediate?: boolean;
  /** Gate the automatic loads, for tables that live in a dialog and load when it opens */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Runs before each automatic load, for state that belongs to the current page (e.g. the row selection) */
  onBeforeLoad?: () => void;
}

export interface UseTableDataReturn<T> {
  data: Ref<T[]>;
  total: Ref<number>;
  loading: Ref<boolean>;
  tableOptions: TableOptions;
  /** Load the current page, awaited by operations that need the fresh rows */
  load: () => Promise<void>;
  /** Reload the current page */
  refresh: () => void;
  /** Reset to the first page and reload */
  search: () => void;
}

/**
 * Own the paginated table state of a page: the rows, the server pagination and the request lifecycle.
 *
 * The hook keeps the latest request winning (a slow response cannot overwrite a newer one) and reloads
 * automatically when the page, the page size or the search revision changes.
 *
 * @param options The fetcher, initial pagination and load hooks
 */
export function useTableData<T>(options: UseTableDataOptions<T>): UseTableDataReturn<T> {
  const { fetchData, pageSize = 10, immediate = true, enabled, onBeforeLoad } = options;

  const data = shallowRef<T[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const tableOptions = reactive<TableOptions>({
    page: 1,
    itemsPerPage: pageSize,
  });

  const refreshKey = ref(0);

  let requestSequence = 0;

  async function load(): Promise<void> {
    const sequence = ++requestSequence;

    loading.value = true;

    try {
      const { data: page, error } = await fetchData({
        pageNum: tableOptions.page,
        pageSize: tableOptions.itemsPerPage,
      });

      // A newer request started while this one was in flight, its result owns the table
      if (sequence !== requestSequence) {
        return;
      }

      if (error) {
        data.value = [];
        total.value = 0;

        return;
      }

      data.value = page.rows;
      total.value = page.total;
    } finally {
      if (sequence === requestSequence) {
        loading.value = false;
      }
    }
  }

  function refresh() {
    refreshKey.value += 1;
  }

  function search() {
    tableOptions.page = 1;
    refresh();
  }

  watch(
    () => [tableOptions.page, tableOptions.itemsPerPage, refreshKey.value],
    () => {
      if (enabled !== undefined && !toValue(enabled)) {
        return;
      }

      onBeforeLoad?.();
      void load();
    },
    { immediate },
  );

  return {
    data,
    total,
    loading,
    tableOptions,
    load,
    refresh,
    search,
  };
}

export interface UseTableOperateOptions<RowKey extends string | number> {
  /** The selection owned by the page and cleared on every table reload; omit it to let the hook own the selection */
  checkedRowKeys?: ShallowRef<RowKey[]>;
}

export interface UseTableOperateReturn<TableData, RowKey extends string | number = string> {
  drawerVisible: Ref<boolean>;
  openDrawer: () => void;
  closeDrawer: () => void;
  operateType: ShallowRef<'add' | 'edit'>;
  handleAdd: () => void;
  handleEdit: (id: TableData[keyof TableData]) => void;
  editingData: ShallowRef<TableData | null>;
  checkedRowKeys: ShallowRef<RowKey[]>;
  onBatchDeleted: () => Promise<void>;
  onDeleted: () => Promise<void>;
}

/**
 * Manage the add/edit drawer state and batch selection of a table
 *
 * @param data The table data
 * @param idKey The id key of a row
 * @param getData The data fetcher, loaded after a deletion
 * @param options The optional page-owned selection, cleared by the page on every reload
 */
export function useTableOperate<TableData, RowKey extends string | number = string>(
  data: Ref<TableData[]>,
  idKey: keyof TableData,
  getData: () => Promise<void>,
  options: UseTableOperateOptions<RowKey> = {},
): UseTableOperateReturn<TableData, RowKey> {
  const { bool: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean();

  const operateType = shallowRef<'add' | 'edit'>('add');

  const editingData = shallowRef<TableData | null>(null);

  const checkedRowKeys = options.checkedRowKeys ?? shallowRef<RowKey[]>([]);

  function handleAdd() {
    operateType.value = 'add';
    editingData.value = null;
    openDrawer();
  }

  function handleEdit(id: TableData[keyof TableData]) {
    operateType.value = 'edit';

    const findItem = data.value.find((item) => item[idKey] === id) || null;

    editingData.value = jsonClone(findItem);

    openDrawer();
  }

  async function onBatchDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    checkedRowKeys.value = [];

    await getData();
  }

  async function onDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    await getData();
  }

  return {
    drawerVisible,
    openDrawer,
    closeDrawer,
    operateType,
    handleAdd,
    handleEdit,
    editingData,
    checkedRowKeys,
    onBatchDeleted,
    onDeleted,
  };
}

/** Generate the column checks used by a table column setting component */
export function getColumnChecks<T extends { key?: string | number; title?: string }>(
  columns: T[],
): TableColumnCheck[] {
  return columns
    .filter((column) => column.key !== undefined)
    .map((column) => ({
      key: String(column.key),
      title: String(column.title ?? column.key),
      checked: true,
      visible: true,
    }));
}

/** Filter the columns by the column checks */
export function getColumnsByChecks<T extends { key?: string | number }>(
  columns: T[],
  checks: TableColumnCheck[],
) {
  const checkedKeys = new Set(checks.filter((check) => check.checked).map((check) => check.key));

  return columns.filter(
    (column) => column.key !== undefined && checkedKeys.has(String(column.key)),
  );
}
