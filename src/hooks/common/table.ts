import { computed, reactive, ref, shallowRef } from 'vue';
import type { Ref, ShallowRef } from 'vue';

import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

export interface TableColumnCheck {
  key: string;
  title: string;
  checked: boolean;
  visible: boolean;
}

/**
 * A small pagination hook that is independent of the UI library
 *
 * @param fetchData The data fetcher
 */
export function usePagination<T>(
  fetchData: (pageNum: number, pageSize: number) => Promise<CommonType.PaginationData<T>>,
) {
  const data = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  async function getData(pageNum = pagination.pageNum) {
    loading.value = true;
    pagination.pageNum = pageNum;

    try {
      const result = await fetchData(pagination.pageNum, pagination.pageSize);

      data.value = result.data;
      pagination.total = result.total;
      pagination.pageSize = result.pageSize;
    } finally {
      loading.value = false;
    }
  }

  function setPageSize(pageSize: number) {
    pagination.pageSize = pageSize;
    pagination.pageNum = 1;

    return getData(1);
  }

  return {
    data,
    loading,
    pagination,
    getData,
    setPageSize,
  };
}

/**
 * Manage the add/edit drawer state and batch selection of a table
 *
 * @param data The table data
 * @param idKey The id key of a row
 * @param getData The data fetcher
 */
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

export function useTableOperate<TableData, RowKey extends string | number = string>(
  data: Ref<TableData[]>,
  idKey: keyof TableData,
  getData: () => Promise<void>,
): UseTableOperateReturn<TableData, RowKey> {
  const { boolValue: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBool();

  const operateType = shallowRef<'add' | 'edit'>('add');

  const editingData = shallowRef<TableData | null>(null);

  const checkedRowKeys = shallowRef<RowKey[]>([]);

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

/** A tiny boolean ref helper, it avoids pulling a full utility library into the hook */
export interface UseBoolReturn {
  boolValue: Ref<boolean>;
  setBool: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

export function useBool(initial = false): UseBoolReturn {
  const boolValue = ref(initial);

  function setBool(value: boolean) {
    boolValue.value = value;
  }

  function setTrue() {
    setBool(true);
  }

  function setFalse() {
    setBool(false);
  }

  function toggle() {
    setBool(!boolValue.value);
  }

  return { boolValue, setBool, setTrue, setFalse, toggle };
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

/** Calculate the total table width, which is used for horizontal scrolling */
export function useTableScrollX(widths: Ref<number[]>) {
  return computed(() => widths.value.reduce((total, width) => total + width, 0));
}
