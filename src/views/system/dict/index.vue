<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { enableStatusRecord, permissionCodes } from '@/constants/business';
import { useAuth } from '@/hooks/business/auth';
import { useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  fetchDeleteDictData,
  fetchDeleteDictTypes,
  fetchGetDictDataList,
  fetchGetDictTypeList,
  fetchRefreshDictTypeCache,
} from '@/service/api/system-dict';

import DictDataOperateDrawer from './modules/DictDataOperateDrawer.vue';
import DictDataSearch from './modules/DictDataSearch.vue';
import DictTypeOperateDrawer from './modules/DictTypeOperateDrawer.vue';
import DictTypeSearch from './modules/DictTypeSearch.vue';

defineOptions({ name: 'SystemDict' });

interface DictTableHeader {
  key: string;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'start' | 'center' | 'end';
}

const pageSizeOptions = [10, 20, 50];

const { hasAuth } = useAuth();

const canAdd = computed(() => hasAuth(permissionCodes.dictAdd));
const canEdit = computed(() => hasAuth(permissionCodes.dictEdit));
const canDelete = computed(() => hasAuth(permissionCodes.dictDelete));

const typeSearch = ref<Api.SystemDict.DictTypeSearchModel>({
  dictName: null,
  dictType: null,
  status: null,
});

const typePage = reactive({ page: 1, itemsPerPage: 10 });
const typeList = ref<Api.SystemDict.DictType[]>([]);
const typeTotal = ref(0);
const typeLoading = ref(false);
const typeRefreshKey = ref(0);
const cacheLoading = ref(false);

const selectedType = ref('');
const selectedTypeName = ref('');

const typeHeaders = computed<DictTableHeader[]>(() => [
  { key: 'dictName', title: $t('page.dict.type.columns.dictName'), minWidth: 140 },
  { key: 'dictType', title: $t('page.dict.type.columns.dictType'), minWidth: 150 },
  { key: 'status', title: $t('page.dict.type.columns.status'), width: 90, align: 'center' },
  { key: 'actions', title: $t('page.dict.type.columns.actions'), width: 100, align: 'center' },
]);

async function loadTypes() {
  typeLoading.value = true;

  const { data: typeListData, error } = await fetchGetDictTypeList({
    ...typeSearch.value,
    pageNum: typePage.page,
    pageSize: typePage.itemsPerPage,
  });

  typeLoading.value = false;

  if (error) {
    typeList.value = [];
    typeTotal.value = 0;

    return;
  }

  typeList.value = typeListData.rows;
  typeTotal.value = typeListData.total;

  if (selectedType.value && !typeList.value.some((item) => item.dictType === selectedType.value)) {
    selectedType.value = '';
    selectedTypeName.value = '';
  }
}

const {
  drawerVisible: typeDrawerVisible,
  operateType: typeOperateType,
  editingData: typeEditingData,
  handleAdd: handleTypeAdd,
  handleEdit: handleTypeEdit,
} = useTableOperate<Api.SystemDict.DictType, number>(typeList, 'dictId', loadTypes);

const dataSearch = ref<Api.SystemDict.DictDataSearchModel>({
  dictType: null,
  dictLabel: null,
  status: null,
});

const dataPage = reactive({ page: 1, itemsPerPage: 10 });
const dataList = ref<Api.SystemDict.DictData[]>([]);
const dataTotal = ref(0);
const dataLoading = ref(false);
const dataRefreshKey = ref(0);

const dataHeaders = computed<DictTableHeader[]>(() => [
  { key: 'dictLabel', title: $t('page.dict.data.columns.dictLabel'), minWidth: 140 },
  { key: 'dictValue', title: $t('page.dict.data.columns.dictValue'), minWidth: 130 },
  { key: 'dictSort', title: $t('page.dict.data.columns.dictSort'), width: 90, align: 'center' },
  { key: 'status', title: $t('page.dict.data.columns.status'), width: 90, align: 'center' },
  { key: 'actions', title: $t('page.dict.data.columns.actions'), width: 100, align: 'center' },
]);

async function loadData() {
  if (!selectedType.value) {
    dataList.value = [];
    dataTotal.value = 0;

    return;
  }

  dataLoading.value = true;

  const { data: dataListData, error } = await fetchGetDictDataList({
    dictType: selectedType.value,
    dictLabel: dataSearch.value.dictLabel,
    status: dataSearch.value.status,
    pageNum: dataPage.page,
    pageSize: dataPage.itemsPerPage,
  });

  dataLoading.value = false;

  if (error) {
    dataList.value = [];
    dataTotal.value = 0;

    return;
  }

  dataList.value = dataListData.rows;
  dataTotal.value = dataListData.total;
}

const {
  drawerVisible: dataDrawerVisible,
  operateType: dataOperateType,
  editingData: dataEditingData,
  handleAdd: handleDataAdd,
  handleEdit: handleDataEdit,
} = useTableOperate<Api.SystemDict.DictData, number>(dataList, 'dictCode', loadData);

const selectedTypeLabel = computed(() => selectedTypeName.value || selectedType.value);

function selectType(item: Api.SystemDict.DictType) {
  if (selectedType.value === item.dictType) {
    return;
  }

  selectedType.value = item.dictType;
  selectedTypeName.value = item.dictName;
  dataSearch.value.dictLabel = null;
  dataSearch.value.status = null;
  dataPage.page = 1;
  dataRefreshKey.value += 1;
}

function typeRowProps({ item }: { item: Api.SystemDict.DictType }) {
  return {
    class: ['cursor-pointer', item.dictType === selectedType.value ? 'bg-primary/5' : ''].join(' '),
    onClick: () => selectType(item),
  };
}

watch(
  () => [typePage.page, typePage.itemsPerPage, typeRefreshKey.value],
  () => {
    void loadTypes();
  },
  { immediate: true },
);

watch(
  () => [dataPage.page, dataPage.itemsPerPage, dataRefreshKey.value],
  () => {
    void loadData();
  },
);

watch(
  () => typeTotal.value,
  (total) => {
    if (total === 0) {
      typePage.page = 1;
    }
  },
);

watch(
  () => dataTotal.value,
  (total) => {
    if (total === 0) {
      dataPage.page = 1;
    }
  },
);

function handleTypeSearch() {
  typePage.page = 1;
  typeRefreshKey.value += 1;
}

function handleTypeSubmitted() {
  typeRefreshKey.value += 1;
}

function handleDataSearch() {
  dataPage.page = 1;
  dataRefreshKey.value += 1;
}

function handleDataSubmitted() {
  dataRefreshKey.value += 1;
}

async function handleRefreshCache() {
  cacheLoading.value = true;

  try {
    const { error } = await fetchRefreshDictTypeCache();

    if (!error) {
      window.$message?.success($t('page.dict.type.refreshSuccess'));
    }
  } finally {
    cacheLoading.value = false;
  }
}

function handleDeleteType(item: Api.SystemDict.DictType) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.dict.type.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteDictTypes([item.dictId]);

      if (error) {
        return;
      }

      if (selectedType.value === item.dictType) {
        selectedType.value = '';
        selectedTypeName.value = '';
      }

      window.$message?.success($t('common.deleteSuccess'));

      typeRefreshKey.value += 1;
    },
  });
}

function handleDeleteData(item: Api.SystemDict.DictData) {
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.dict.data.confirmDelete'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchDeleteDictData([item.dictCode]);

      if (error) {
        return;
      }

      window.$message?.success($t('common.deleteSuccess'));

      dataRefreshKey.value += 1;
    },
  });
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <VRow class="min-h-[70vh] lg:h-full lg:min-h-0" dense>
      <VCol cols="12" lg="6">
        <VCard class="app-panel flex h-full min-h-0 flex-col overflow-hidden" variant="flat">
          <div class="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
            <span class="text-base font-700">{{ $t('page.dict.type.title') }}</span>

            <div class="flex items-center gap-1">
              <VBtn
                v-if="canAdd"
                color="primary"
                prepend-icon="mdi-plus"
                rounded="lg"
                size="small"
                @click="handleTypeAdd"
              >
                {{ $t('page.dict.type.add') }}
              </VBtn>

              <VBtn
                v-if="canDelete"
                :aria-label="$t('page.dict.type.refreshCache')"
                icon="mdi-refresh"
                :loading="cacheLoading"
                size="small"
                variant="text"
                @click="handleRefreshCache"
              >
                <VIcon icon="mdi-refresh" />
                <VTooltip activator="parent" location="bottom">
                  {{ $t('page.dict.type.refreshCache') }}
                </VTooltip>
              </VBtn>
            </div>
          </div>

          <VDivider />

          <DictTypeSearch v-model:model="typeSearch" @search="handleTypeSearch" />

          <VDivider />

          <VDataTableServer
            v-model:items-per-page="typePage.itemsPerPage"
            v-model:page="typePage.page"
            class="min-h-0 flex-1"
            density="comfortable"
            fixed-header
            :headers="typeHeaders"
            :hide-default-footer="typeTotal === 0"
            hover
            item-value="dictId"
            :items="typeList"
            :items-length="typeTotal"
            :items-per-page-options="pageSizeOptions"
            :loading="typeLoading"
            :no-data-text="$t('page.dict.type.empty')"
            :row-props="typeRowProps"
          >
            <template #item.dictName="{ item }">
              <span class="font-500">{{ item.dictName }}</span>
            </template>

            <template #item.dictType="{ item }">
              <VCode class="text-xs">{{ item.dictType }}</VCode>
            </template>

            <template #item.status="{ item }">
              <VChip
                :color="item.status === '0' ? 'success' : 'warning'"
                size="small"
                variant="tonal"
              >
                {{ $t(enableStatusRecord[item.status]) }}
              </VChip>
            </template>

            <template #item.actions="{ item }">
              <VBtn
                v-if="canEdit"
                :aria-label="$t('common.edit')"
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                @click.stop="handleTypeEdit(item.dictId)"
              />
              <VBtn
                v-if="canDelete"
                :aria-label="$t('common.delete')"
                color="error"
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                @click.stop="handleDeleteType(item)"
              />
            </template>

            <template #no-data>
              <div class="py-10 text-center">
                <VIcon class="opacity-20" icon="mdi-book-open-variant" size="48" />
                <div class="mt-2 text-sm opacity-50">{{ $t('page.dict.type.empty') }}</div>
              </div>
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>

      <VCol cols="12" lg="6">
        <VCard class="app-panel flex h-full min-h-0 flex-col overflow-hidden" variant="flat">
          <div class="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
            <div class="min-w-0 flex items-center gap-2">
              <span class="text-base font-700">{{ $t('page.dict.data.title') }}</span>

              <VChip v-if="selectedType" color="primary" size="small" variant="tonal">
                {{ selectedTypeLabel }}
              </VChip>
            </div>

            <div class="flex items-center gap-1">
              <VBtn
                v-if="canAdd"
                color="primary"
                :disabled="!selectedType"
                prepend-icon="mdi-plus"
                rounded="lg"
                size="small"
                @click="handleDataAdd"
              >
                {{ $t('page.dict.data.add') }}
              </VBtn>

              <VBtn
                :aria-label="$t('common.refresh')"
                icon="mdi-refresh"
                size="small"
                variant="text"
                @click="handleDataSearch"
              />
            </div>
          </div>

          <VDivider />

          <DictDataSearch
            v-model:model="dataSearch"
            :disabled="!selectedType"
            @search="handleDataSearch"
          />

          <VDivider />

          <div v-if="!selectedType" class="min-h-0 flex flex-1 items-center justify-center p-8">
            <div class="text-center">
              <VIcon class="opacity-20" icon="mdi-cursor-default-click-outline" size="52" />
              <div class="mt-2 text-sm opacity-50">{{ $t('page.dict.type.selectHint') }}</div>
            </div>
          </div>

          <VDataTableServer
            v-else
            v-model:items-per-page="dataPage.itemsPerPage"
            v-model:page="dataPage.page"
            class="min-h-0 flex-1"
            density="comfortable"
            fixed-header
            :headers="dataHeaders"
            :hide-default-footer="dataTotal === 0"
            hover
            item-value="dictCode"
            :items="dataList"
            :items-length="dataTotal"
            :items-per-page-options="pageSizeOptions"
            :loading="dataLoading"
            :no-data-text="$t('page.dict.data.empty')"
          >
            <template #item.dictLabel="{ item }">
              <VChip
                v-if="item.listClass && item.listClass !== 'default'"
                :color="item.listClass"
                size="small"
                variant="tonal"
              >
                {{ item.dictLabel }}
              </VChip>
              <span v-else class="font-500">{{ item.dictLabel }}</span>
            </template>

            <template #item.dictValue="{ item }">
              <VCode class="text-xs">{{ item.dictValue }}</VCode>
            </template>

            <template #item.dictSort="{ item }">
              <span class="text-xs opacity-60">{{ item.dictSort }}</span>
            </template>

            <template #item.status="{ item }">
              <VChip
                :color="item.status === '0' ? 'success' : 'warning'"
                size="small"
                variant="tonal"
              >
                {{ $t(enableStatusRecord[item.status]) }}
              </VChip>
            </template>

            <template #item.actions="{ item }">
              <VBtn
                v-if="canEdit"
                :aria-label="$t('common.edit')"
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                @click="handleDataEdit(item.dictCode)"
              />
              <VBtn
                v-if="canDelete"
                :aria-label="$t('common.delete')"
                color="error"
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                @click="handleDeleteData(item)"
              />
            </template>

            <template #no-data>
              <div class="py-10 text-center">
                <VIcon class="opacity-20" icon="mdi-book-open-page-variant-outline" size="48" />
                <div class="mt-2 text-sm opacity-50">{{ $t('page.dict.data.empty') }}</div>
              </div>
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>

    <DictTypeOperateDrawer
      v-model:visible="typeDrawerVisible"
      :operate-type="typeOperateType"
      :row-data="typeEditingData"
      @submitted="handleTypeSubmitted"
    />

    <DictDataOperateDrawer
      v-model:visible="dataDrawerVisible"
      :dict-type="selectedType"
      :operate-type="dataOperateType"
      :row-data="dataEditingData"
      @submitted="handleDataSubmitted"
    />
  </div>
</template>
