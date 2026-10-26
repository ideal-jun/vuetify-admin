<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@/locales';
import { fetchGetDbTableList, fetchImportGenTables } from '@/service/api/tool-gen';

defineOptions({ name: 'GenImportDialog' });

const emit = defineEmits<{
  imported: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

interface DbTableHeader {
  key: 'tableName' | 'tableComment' | 'createTime' | 'updateTime';
  title: string;
  width?: number | string;
  minWidth?: number | string;
  sortable?: boolean;
}

const pageSizeOptions = [10, 20, 50];

function createDefaultSearchModel(): Api.ToolGen.GenTableSearchModel {
  return {
    tableName: null,
    tableComment: null,
  };
}

const searchParams = ref<Api.ToolGen.GenTableSearchModel>(createDefaultSearchModel());

const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
});

const rows = ref<Api.ToolGen.DbTable[]>([]);
const total = ref(0);
const loading = ref(false);
const importing = ref(false);
const refreshKey = ref(0);

const checkedTables = ref<string[]>([]);

const tplWebType = ref<Api.ToolGen.TplWebType>('element-plus');

const webTypeOptions = computed<CommonType.Option<Api.ToolGen.TplWebType>[]>(() => [
  { label: $t('page.gen.webTypes.elementUi'), value: 'element-ui' },
  { label: $t('page.gen.webTypes.elementPlus'), value: 'element-plus' },
  { label: $t('page.gen.webTypes.elementPlusTypescript'), value: 'element-plus-typescript' },
]);

const headers = computed<DbTableHeader[]>(() => [
  { key: 'tableName', title: $t('page.gen.columns.tableName'), minWidth: 180, sortable: false },
  {
    key: 'tableComment',
    title: $t('page.gen.columns.tableComment'),
    minWidth: 180,
    sortable: false,
  },
  { key: 'createTime', title: $t('page.gen.columns.createTime'), width: 180, sortable: false },
  { key: 'updateTime', title: $t('page.gen.columns.updateTime'), width: 180, sortable: false },
]);

let requestSequence = 0;

async function loadDbTables() {
  const sequence = ++requestSequence;

  loading.value = true;

  const { data, error } = await fetchGetDbTableList({
    ...searchParams.value,
    pageNum: tableOptions.page,
    pageSize: tableOptions.itemsPerPage,
  });

  if (sequence !== requestSequence) {
    return;
  }

  loading.value = false;

  if (error) {
    rows.value = [];
    total.value = 0;

    return;
  }

  rows.value = data.rows;
  total.value = data.total;
}

function handleSearch() {
  tableOptions.page = 1;
  refreshKey.value += 1;
}

function handleReset() {
  searchParams.value = createDefaultSearchModel();
  handleSearch();
}

async function handleImport() {
  const tables = checkedTables.value.join(',');

  if (!tables) {
    window.$message?.warning($t('page.gen.import.noSelection'));

    return;
  }

  importing.value = true;

  try {
    const { error } = await fetchImportGenTables({ tables, tplWebType: tplWebType.value });

    if (error) {
      return;
    }

    window.$message?.success($t('page.gen.import.success'));

    visible.value = false;
    emit('imported');
  } finally {
    importing.value = false;
  }
}

watch(visible, (value) => {
  if (!value) {
    return;
  }

  checkedTables.value = [];
  searchParams.value = createDefaultSearchModel();
  tableOptions.page = 1;
  refreshKey.value += 1;
});

watch(
  () => [tableOptions.page, tableOptions.itemsPerPage, refreshKey.value],
  () => {
    if (visible.value) {
      checkedTables.value = [];
      void loadDbTables();
    }
  },
  { immediate: true },
);
</script>

<template>
  <VDialog v-model="visible" max-width="960" scrollable>
    <VCard rounded="xl">
      <VCardTitle class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-600">{{ $t('page.gen.import.title') }}</div>
          <div class="mt-1 text-xs opacity-60">{{ $t('page.gen.import.desc') }}</div>
        </div>

        <VBtn
          :aria-label="$t('page.gen.import.close')"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="visible = false"
        />
      </VCardTitle>

      <VDivider />

      <VCardText class="py-4">
        <VDefaultsProvider
          :defaults="{
            VTextField: { density: 'compact', color: 'primary' },
            VSelect: { density: 'compact', color: 'primary' },
          }"
        >
          <VForm @submit.prevent="handleSearch">
            <VRow density="compact">
              <VCol cols="12" md="3" sm="6">
                <VTextField
                  v-model="searchParams.tableName"
                  clearable
                  :label="$t('page.gen.import.searchTableName')"
                  :placeholder="$t('page.gen.import.searchTableNamePlaceholder')"
                  prepend-inner-icon="mdi-table"
                />
              </VCol>

              <VCol cols="12" md="3" sm="6">
                <VTextField
                  v-model="searchParams.tableComment"
                  clearable
                  :label="$t('page.gen.import.searchTableComment')"
                  :placeholder="$t('page.gen.import.searchTableCommentPlaceholder')"
                  prepend-inner-icon="mdi-text-box-outline"
                />
              </VCol>

              <VCol cols="12" md="3" sm="6">
                <VSelect
                  v-model="tplWebType"
                  item-title="label"
                  item-value="value"
                  :items="webTypeOptions"
                  :label="$t('page.gen.import.tplWebType')"
                  prepend-inner-icon="mdi-vuejs"
                />
              </VCol>

              <VCol class="flex flex-wrap items-end justify-end gap-2" cols="12" md="3" sm="6">
                <VBtn prepend-icon="mdi-refresh" variant="text" @click="handleReset">
                  {{ $t('common.reset') }}
                </VBtn>
                <VBtn color="primary" prepend-icon="mdi-magnify" type="submit">
                  {{ $t('common.search') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VDefaultsProvider>
      </VCardText>

      <VDivider />

      <VCardText class="flex flex-wrap items-center justify-end gap-2 py-2">
        <VChip v-if="checkedTables.length > 0" color="primary" size="small" variant="tonal">
          {{ $t('page.gen.import.selectedCount', { count: checkedTables.length }) }}
        </VChip>

        <VBtn
          color="primary"
          :disabled="checkedTables.length === 0"
          :loading="importing"
          prepend-icon="mdi-download"
          @click="handleImport"
        >
          {{ $t('page.gen.actions.import') }}
        </VBtn>
      </VCardText>

      <VDataTableServer
        v-model="checkedTables"
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        class="mx-4 min-h-0"
        density="comfortable"
        fixed-header
        :headers="headers"
        :hide-default-footer="total === 0"
        hover
        item-value="tableName"
        :items="rows"
        :items-length="total"
        :items-per-page-options="pageSizeOptions"
        :loading="loading"
        :no-data-text="$t('page.gen.import.empty')"
        select-strategy="page"
        show-current-page
        show-select
      >
        <template #item.tableName="{ item }">
          <VCode class="text-xs">{{ item.tableName }}</VCode>
        </template>

        <template #item.tableComment="{ item }">
          <span class="text-sm">{{ item.tableComment || '—' }}</span>
        </template>

        <template #item.createTime="{ item }">
          <span class="text-xs opacity-60">{{ item.createTime || '—' }}</span>
        </template>

        <template #item.updateTime="{ item }">
          <span class="text-xs opacity-60">{{ item.updateTime || '—' }}</span>
        </template>

        <template #no-data>
          <div class="py-10 text-center">
            <VIcon class="opacity-20" icon="mdi-database-search-outline" size="48" />
            <div class="mt-2 text-sm opacity-50">{{ $t('page.gen.import.empty') }}</div>
          </div>
        </template>
      </VDataTableServer>

      <VCardActions class="justify-end">
        <VBtn :disabled="importing" variant="text" @click="visible = false">
          {{ $t('page.gen.import.close') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
