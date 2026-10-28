import { flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import type { TablePage, TablePageRequest } from './table';
import { useTableData } from './table';

interface Row {
  id: number;
}

type Fetch = (request: TablePageRequest) => Promise<App.Service.FlatResponseData<TablePage<Row>>>;

function ok(rows: Row[], total = rows.length): App.Service.FlatResponseData<TablePage<Row>> {
  return { data: { rows, total }, error: null };
}

function failed(): App.Service.FlatResponseData<TablePage<Row>> {
  return { data: null, error: { code: '500', message: 'boom' } };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

describe('useTableData', () => {
  it('loads the first page on setup and exposes the rows and total', async () => {
    const fetchData = vi.fn<Fetch>(async () => ok([{ id: 1 }], 7));

    const table = useTableData({ fetchData });

    await flushPromises();

    expect(fetchData).toHaveBeenCalledWith({ pageNum: 1, pageSize: 10 });
    expect(table.data.value).toEqual([{ id: 1 }]);
    expect(table.total.value).toBe(7);
    expect(table.loading.value).toBe(false);
  });

  it('reloads on pagination changes and resets to page one on search', async () => {
    const fetchData = vi.fn<Fetch>(async () => ok([{ id: 1 }]));

    const table = useTableData({ fetchData });

    await flushPromises();

    table.tableOptions.page = 2;
    await flushPromises();

    expect(fetchData).toHaveBeenLastCalledWith({ pageNum: 2, pageSize: 10 });

    table.tableOptions.itemsPerPage = 20;
    await flushPromises();

    expect(fetchData).toHaveBeenLastCalledWith({ pageNum: 2, pageSize: 20 });

    table.search();
    await flushPromises();

    expect(fetchData).toHaveBeenLastCalledWith({ pageNum: 1, pageSize: 20 });
    expect(fetchData).toHaveBeenCalledTimes(4);
  });

  it('keeps the newest response when a superseded request settles late', async () => {
    const first = deferred<App.Service.FlatResponseData<TablePage<Row>>>();
    const second = deferred<App.Service.FlatResponseData<TablePage<Row>>>();
    const fetchData = vi
      .fn<Fetch>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const table = useTableData({ fetchData });

    await flushPromises();

    table.search();
    await flushPromises();

    second.resolve(ok([{ id: 2 }], 2));
    await flushPromises();

    first.resolve(ok([{ id: 1 }], 1));
    await flushPromises();

    expect(table.data.value).toEqual([{ id: 2 }]);
    expect(table.total.value).toBe(2);
    expect(table.loading.value).toBe(false);
  });

  it('clears the rows and total when the request fails', async () => {
    const fetchData = vi.fn<Fetch>(async () => failed());

    const table = useTableData({ fetchData });

    await flushPromises();

    expect(table.data.value).toEqual([]);
    expect(table.total.value).toBe(0);
    expect(table.loading.value).toBe(false);
  });

  it('skips loads while disabled and resumes when enabled', async () => {
    const enabled = ref(false);
    const fetchData = vi.fn<Fetch>(async () => ok([{ id: 1 }]));

    const table = useTableData({ fetchData, enabled });

    await flushPromises();

    expect(fetchData).not.toHaveBeenCalled();

    enabled.value = true;
    table.search();
    await flushPromises();

    expect(fetchData).toHaveBeenCalledTimes(1);
    expect(table.data.value).toEqual([{ id: 1 }]);
  });

  it('runs onBeforeLoad before every automatic load', async () => {
    const calls: string[] = [];
    const fetchData = vi.fn<Fetch>(async () => {
      calls.push('load');

      return ok([{ id: 1 }]);
    });

    const table = useTableData({
      fetchData,
      onBeforeLoad: () => calls.push('before'),
    });

    await flushPromises();

    table.refresh();
    await flushPromises();

    expect(calls).toEqual(['before', 'load', 'before', 'load']);
  });
});
