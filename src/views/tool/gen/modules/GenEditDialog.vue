<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchGetDictTypeOptions } from '@/service/api/system-dict';
import { fetchGetGenTable, fetchUpdateGenTable } from '@/service/api/tool-gen';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'GenEditDialog' });

interface Props {
  /** The generation config id, null means nothing to load */
  tableId: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  saved: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

type ColumnFlagKey = 'isRequired' | 'isInsert' | 'isEdit' | 'isList' | 'isQuery';

interface ColumnTableHeader {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
}

const { formRef, validate, resetValidation } = useVuetifyForm();

const loading = ref(false);
const saving = ref(false);
const loadFailed = ref(false);
const activeTab = ref<'basic' | 'columns'>('basic');

const info = ref<Api.ToolGen.GenTable | null>(null);
const columns = ref<Api.ToolGen.Column[]>([]);
const tables = ref<Api.ToolGen.GenTable[]>([]);
const dictOptions = ref<Api.SystemDict.DictTypeOption[]>([]);

const javaTypeOptions = ['Long', 'String', 'Integer', 'Double', 'BigDecimal', 'Date', 'Boolean'];

const templateOptions = computed<CommonType.Option<Api.ToolGen.TplCategory>[]>(() => [
  { label: $t('page.gen.templates.crud'), value: 'crud' },
  { label: $t('page.gen.templates.tree'), value: 'tree' },
  { label: $t('page.gen.templates.sub'), value: 'sub' },
]);

const webTypeOptions = computed<CommonType.Option<Api.ToolGen.TplWebType>[]>(() => [
  { label: $t('page.gen.webTypes.elementUi'), value: 'element-ui' },
  { label: $t('page.gen.webTypes.elementPlus'), value: 'element-plus' },
  { label: $t('page.gen.webTypes.elementPlusTypescript'), value: 'element-plus-typescript' },
]);

const genTypeOptions = computed<CommonType.Option<Api.ToolGen.GenType>[]>(() => [
  { label: $t('page.gen.edit.genTypeZip'), value: '0' },
  { label: $t('page.gen.edit.genTypePath'), value: '1' },
]);

const queryTypeOptions = computed<CommonType.Option<string>[]>(() =>
  (['EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE', 'LIKE', 'BETWEEN'] as const).map((value) => ({
    value,
    label: $t(`page.gen.queryTypes.${value}` as App.I18n.I18nKey),
  })),
);

const htmlTypeOptions = computed<CommonType.Option<string>[]>(() =>
  (
    [
      'input',
      'textarea',
      'select',
      'radio',
      'checkbox',
      'datetime',
      'imageUpload',
      'fileUpload',
      'editor',
    ] as const
  ).map((value) => ({
    value,
    label: $t(`page.gen.htmlTypes.${value}` as App.I18n.I18nKey),
  })),
);

const isTree = computed(() => info.value?.tplCategory === 'tree');
const isSub = computed(() => info.value?.tplCategory === 'sub');
const isCustomPath = computed(() => info.value?.genType === '1');

function toColumnOptions(rows: Api.ToolGen.Column[]): CommonType.Option<string>[] {
  return rows
    .filter((row): row is Api.ToolGen.Column & { columnName: string } => Boolean(row.columnName))
    .map((row) => ({
      value: row.columnName,
      label: row.columnComment ? `${row.columnName} (${row.columnComment})` : row.columnName,
    }));
}

const columnOptions = computed(() => toColumnOptions(columns.value));

const subTableOptions = computed<CommonType.Option<string>[]>(() =>
  tables.value
    .filter((table) => table.tableName !== info.value?.tableName)
    .map((table) => ({
      value: table.tableName,
      label: table.tableComment ? `${table.tableName} (${table.tableComment})` : table.tableName,
    })),
);

const subColumnOptions = computed(() => {
  const subTableName = info.value?.subTableName;
  const subTable = tables.value.find((table) => table.tableName === subTableName);

  return toColumnOptions(subTable?.columns ?? []);
});

const rules = computed(() => {
  const required = useFormRules().createRequiredRule($t('form.required'));

  return {
    tableName: [required],
    tableComment: [required],
    className: [required],
    functionAuthor: [required],
    packageName: [required],
    moduleName: [required],
    businessName: [required],
    functionName: [required],
  };
});

const columnHeaders = computed<ColumnTableHeader[]>(() => [
  { key: 'columnName', title: $t('page.gen.columnTable.columnName'), width: 140, sortable: false },
  {
    key: 'columnComment',
    title: $t('page.gen.columnTable.columnComment'),
    minWidth: 160,
    sortable: false,
  },
  {
    key: 'columnType',
    title: $t('page.gen.columnTable.columnType'),
    width: 120,
    sortable: false,
  },
  { key: 'javaType', title: $t('page.gen.columnTable.javaType'), width: 130, sortable: false },
  { key: 'javaField', title: $t('page.gen.columnTable.javaField'), minWidth: 140, sortable: false },
  {
    key: 'isPk',
    title: $t('page.gen.columnTable.isPk'),
    width: 70,
    align: 'center',
    sortable: false,
  },
  {
    key: 'isRequired',
    title: $t('page.gen.columnTable.isRequired'),
    width: 80,
    align: 'center',
    sortable: false,
  },
  {
    key: 'isInsert',
    title: $t('page.gen.columnTable.isInsert'),
    width: 80,
    align: 'center',
    sortable: false,
  },
  {
    key: 'isEdit',
    title: $t('page.gen.columnTable.isEdit'),
    width: 80,
    align: 'center',
    sortable: false,
  },
  {
    key: 'isList',
    title: $t('page.gen.columnTable.isList'),
    width: 80,
    align: 'center',
    sortable: false,
  },
  {
    key: 'isQuery',
    title: $t('page.gen.columnTable.isQuery'),
    width: 80,
    align: 'center',
    sortable: false,
  },
  {
    key: 'queryType',
    title: $t('page.gen.columnTable.queryType'),
    width: 140,
    sortable: false,
  },
  {
    key: 'htmlType',
    title: $t('page.gen.columnTable.htmlType'),
    width: 160,
    sortable: false,
  },
  {
    key: 'dictType',
    title: $t('page.gen.columnTable.dictType'),
    width: 190,
    sortable: false,
  },
]);

function isFlagOn(row: Api.ToolGen.Column, key: ColumnFlagKey) {
  return row[key] === '1';
}

function setFlag(row: Api.ToolGen.Column, key: ColumnFlagKey, value: unknown) {
  row[key] = value ? '1' : '0';
}

function handleCategoryChange(value: unknown) {
  const table = info.value;

  if (!table) {
    return;
  }

  table.tplCategory = (value as Api.ToolGen.TplCategory | null) ?? null;

  if (table.tplCategory !== 'tree') {
    table.treeCode = null;
    table.treeParentCode = null;
    table.treeName = null;
  }

  if (table.tplCategory !== 'sub') {
    table.subTableName = null;
    table.subTableFkName = null;
  }
}

function handleSubTableChange(value: unknown) {
  const table = info.value;

  if (!table) {
    return;
  }

  table.subTableName = (value as string | null) ?? null;
  table.subTableFkName = null;
}

function buildParams(table: Api.ToolGen.GenTable): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (table.treeCode) {
    params.treeCode = table.treeCode;
  }

  if (table.treeParentCode) {
    params.treeParentCode = table.treeParentCode;
  }

  if (table.treeName) {
    params.treeName = table.treeName;
  }

  if (table.parentMenuId) {
    params.parentMenuId = table.parentMenuId;
  }

  if (table.parentMenuName) {
    params.parentMenuName = table.parentMenuName;
  }

  if (table.view) {
    params.view = true;
  }

  return params;
}

async function loadDetail() {
  if (!props.tableId) {
    info.value = null;
    columns.value = [];
    tables.value = [];
    loadFailed.value = false;

    return;
  }

  loading.value = true;
  loadFailed.value = false;
  activeTab.value = 'basic';

  try {
    const { data, error } = await fetchGetGenTable(props.tableId);

    if (error) {
      info.value = null;
      columns.value = [];
      tables.value = [];
      loadFailed.value = true;

      return;
    }

    const table = jsonClone(data.info);

    info.value = {
      ...table,
      tplCategory: table.tplCategory ?? 'crud',
      tplWebType: table.tplWebType ?? 'element-plus',
      genType: table.genType ?? '0',
      genPath: table.genPath ?? '/',
    };
    columns.value = jsonClone(data.rows ?? []);
    tables.value = data.tables ?? [];
  } finally {
    loading.value = false;
  }
}

async function loadDictOptions() {
  if (dictOptions.value.length > 0) {
    return;
  }

  const { data, error } = await fetchGetDictTypeOptions();

  if (!error) {
    dictOptions.value = data;
  }
}

async function handleSubmit() {
  const result = await validate();

  if (result && !result.valid) {
    activeTab.value = 'basic';

    return;
  }

  const table = info.value;

  if (!table) {
    return;
  }

  saving.value = true;

  try {
    const payload: Api.ToolGen.UpdatePayload = {
      ...jsonClone(table),
      columns: jsonClone(columns.value),
      params: buildParams(table),
    };

    const { error } = await fetchUpdateGenTable(payload);

    if (error) {
      return;
    }

    window.$message?.success($t('page.gen.edit.saveSuccess'));

    visible.value = false;
    emit('saved');
  } finally {
    saving.value = false;
  }
}

watch(visible, (value) => {
  if (!value) {
    return;
  }

  resetValidation();
  void loadDetail();
  void loadDictOptions();
});
</script>

<template>
  <VDialog v-model="visible" max-width="1400" scrollable>
    <VCard rounded="xl">
      <VCardTitle class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-600">{{ $t('page.gen.edit.title') }}</div>
          <div class="mt-1 text-xs opacity-60">{{ $t('page.gen.edit.desc') }}</div>
        </div>

        <VBtn
          :aria-label="$t('common.close')"
          :disabled="saving"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="visible = false"
        />
      </VCardTitle>

      <VDivider />

      <VProgressLinear v-if="loading" indeterminate />

      <template v-else-if="info">
        <VTabs v-model="activeTab" class="px-2" density="comfortable">
          <VTab value="basic">{{ $t('page.gen.edit.basicTab') }}</VTab>
          <VTab value="columns"> {{ $t('page.gen.edit.columnsTab') }} ({{ columns.length }}) </VTab>
        </VTabs>

        <VDivider />

        <VCardText class="py-4">
          <VForm ref="formRef" :model="info" @submit.prevent="handleSubmit">
            <div v-show="activeTab === 'basic'">
              <div class="mb-2 text-sm font-600">{{ $t('page.gen.edit.tableInfoTitle') }}</div>

              <VRow density="compact">
                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.tableName"
                    :label="$t('page.gen.edit.tableName')"
                    :placeholder="$t('page.gen.edit.tableNamePlaceholder')"
                    required
                    :rules="rules.tableName"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.tableComment"
                    :label="$t('page.gen.edit.tableComment')"
                    :placeholder="$t('page.gen.edit.tableCommentPlaceholder')"
                    required
                    :rules="rules.tableComment"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.className"
                    :label="$t('page.gen.edit.className')"
                    :placeholder="$t('page.gen.edit.classNamePlaceholder')"
                    required
                    :rules="rules.className"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.functionAuthor"
                    :label="$t('page.gen.edit.functionAuthor')"
                    :placeholder="$t('page.gen.edit.functionAuthorPlaceholder')"
                    required
                    :rules="rules.functionAuthor"
                  />
                </VCol>

                <VCol cols="12" lg="8" md="6">
                  <VTextField
                    v-model="info.remark"
                    :label="$t('page.gen.edit.remark')"
                    :placeholder="$t('page.gen.edit.remarkPlaceholder')"
                  />
                </VCol>
              </VRow>

              <div class="mb-2 mt-5 text-sm font-600">
                {{ $t('page.gen.edit.generationTitle') }}
              </div>

              <VRow density="compact">
                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.packageName"
                    :label="$t('page.gen.edit.packageName')"
                    :placeholder="$t('page.gen.edit.packageNamePlaceholder')"
                    required
                    :rules="rules.packageName"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.moduleName"
                    :label="$t('page.gen.edit.moduleName')"
                    :placeholder="$t('page.gen.edit.moduleNamePlaceholder')"
                    required
                    :rules="rules.moduleName"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.businessName"
                    :label="$t('page.gen.edit.businessName')"
                    :placeholder="$t('page.gen.edit.businessNamePlaceholder')"
                    required
                    :rules="rules.businessName"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VTextField
                    v-model="info.functionName"
                    :label="$t('page.gen.edit.functionName')"
                    :placeholder="$t('page.gen.edit.functionNamePlaceholder')"
                    required
                    :rules="rules.functionName"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VSelect
                    item-title="label"
                    item-value="value"
                    :items="templateOptions"
                    :label="$t('page.gen.edit.tplCategory')"
                    :model-value="info.tplCategory"
                    @update:model-value="handleCategoryChange"
                  />
                </VCol>

                <VCol cols="12" lg="4" md="6">
                  <VSelect
                    v-model="info.tplWebType"
                    item-title="label"
                    item-value="value"
                    :items="webTypeOptions"
                    :label="$t('page.gen.edit.tplWebType')"
                  />
                </VCol>

                <VCol cols="12" lg="8" md="6">
                  <div class="text-sm opacity-80">{{ $t('page.gen.edit.genType') }}</div>

                  <VRadioGroup v-model="info.genType" hide-details inline>
                    <VRadio
                      v-for="option in genTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </VRadioGroup>
                </VCol>

                <VCol v-if="isCustomPath" cols="12" lg="4">
                  <VTextField
                    v-model="info.genPath"
                    :label="$t('page.gen.edit.genPath')"
                    :placeholder="$t('page.gen.edit.genPathPlaceholder')"
                    prepend-inner-icon="mdi-folder-outline"
                  />
                </VCol>
              </VRow>

              <template v-if="isTree">
                <div class="mb-2 mt-5 text-sm font-600">{{ $t('page.gen.edit.treeCode') }}</div>

                <VRow density="compact">
                  <VCol cols="12" lg="4" md="6">
                    <VSelect
                      v-model="info.treeCode"
                      clearable
                      item-title="label"
                      item-value="value"
                      :items="columnOptions"
                      :label="$t('page.gen.edit.treeCode')"
                      :placeholder="$t('page.gen.edit.selectPlaceholder')"
                    />
                  </VCol>

                  <VCol cols="12" lg="4" md="6">
                    <VSelect
                      v-model="info.treeParentCode"
                      clearable
                      item-title="label"
                      item-value="value"
                      :items="columnOptions"
                      :label="$t('page.gen.edit.treeParentCode')"
                      :placeholder="$t('page.gen.edit.selectPlaceholder')"
                    />
                  </VCol>

                  <VCol cols="12" lg="4" md="6">
                    <VSelect
                      v-model="info.treeName"
                      clearable
                      item-title="label"
                      item-value="value"
                      :items="columnOptions"
                      :label="$t('page.gen.edit.treeName')"
                      :placeholder="$t('page.gen.edit.selectPlaceholder')"
                    />
                  </VCol>
                </VRow>
              </template>

              <template v-if="isSub">
                <div class="mb-2 mt-5 text-sm font-600">
                  {{ $t('page.gen.edit.subTableName') }}
                </div>

                <VRow density="compact">
                  <VCol cols="12" lg="4" md="6">
                    <VSelect
                      item-title="label"
                      item-value="value"
                      :items="subTableOptions"
                      :label="$t('page.gen.edit.subTableName')"
                      :model-value="info.subTableName"
                      :placeholder="$t('page.gen.edit.selectPlaceholder')"
                      @update:model-value="handleSubTableChange"
                    />
                  </VCol>

                  <VCol cols="12" lg="4" md="6">
                    <VSelect
                      v-model="info.subTableFkName"
                      clearable
                      item-title="label"
                      item-value="value"
                      :items="subColumnOptions"
                      :label="$t('page.gen.edit.subTableFkName')"
                      :placeholder="$t('page.gen.edit.selectPlaceholder')"
                    />
                  </VCol>
                </VRow>
              </template>
            </div>

            <div v-show="activeTab === 'columns'">
              <div class="mb-1 text-sm font-600">{{ $t('page.gen.edit.columnsTitle') }}</div>
              <div class="mb-3 text-xs opacity-60">{{ $t('page.gen.edit.columnsDesc') }}</div>

              <div class="overflow-x-auto">
                <VDataTable
                  class="min-w-[1360px]"
                  density="compact"
                  :headers="columnHeaders"
                  hide-default-footer
                  :items="columns"
                  :items-per-page="-1"
                  :no-data-text="$t('page.gen.edit.loadFailed')"
                >
                  <template #item.columnName="{ item }">
                    <VCode class="text-xs">{{ item.columnName }}</VCode>
                  </template>

                  <template #item.columnComment="{ item }">
                    <VTextField
                      v-model="item.columnComment"
                      density="compact"
                      hide-details
                      variant="outlined"
                    />
                  </template>

                  <template #item.columnType="{ item }">
                    <span class="text-xs opacity-60">{{ item.columnType }}</span>
                  </template>

                  <template #item.javaType="{ item }">
                    <VSelect
                      v-model="item.javaType"
                      density="compact"
                      hide-details
                      :items="javaTypeOptions"
                      variant="outlined"
                    />
                  </template>

                  <template #item.javaField="{ item }">
                    <VTextField
                      v-model="item.javaField"
                      density="compact"
                      hide-details
                      variant="outlined"
                    />
                  </template>

                  <template #item.isPk="{ item }">
                    <VChip v-if="item.isPk === '1'" color="primary" size="x-small" variant="tonal">
                      PK
                    </VChip>
                    <span v-else class="opacity-40">—</span>
                  </template>

                  <template #item.isRequired="{ item }">
                    <VCheckbox
                      color="primary"
                      density="compact"
                      hide-details
                      :model-value="isFlagOn(item, 'isRequired')"
                      @update:model-value="(value) => setFlag(item, 'isRequired', value)"
                    />
                  </template>

                  <template #item.isInsert="{ item }">
                    <VCheckbox
                      color="primary"
                      density="compact"
                      hide-details
                      :model-value="isFlagOn(item, 'isInsert')"
                      @update:model-value="(value) => setFlag(item, 'isInsert', value)"
                    />
                  </template>

                  <template #item.isEdit="{ item }">
                    <VCheckbox
                      color="primary"
                      density="compact"
                      hide-details
                      :model-value="isFlagOn(item, 'isEdit')"
                      @update:model-value="(value) => setFlag(item, 'isEdit', value)"
                    />
                  </template>

                  <template #item.isList="{ item }">
                    <VCheckbox
                      color="primary"
                      density="compact"
                      hide-details
                      :model-value="isFlagOn(item, 'isList')"
                      @update:model-value="(value) => setFlag(item, 'isList', value)"
                    />
                  </template>

                  <template #item.isQuery="{ item }">
                    <VCheckbox
                      color="primary"
                      density="compact"
                      hide-details
                      :model-value="isFlagOn(item, 'isQuery')"
                      @update:model-value="(value) => setFlag(item, 'isQuery', value)"
                    />
                  </template>

                  <template #item.queryType="{ item }">
                    <VSelect
                      v-model="item.queryType"
                      density="compact"
                      hide-details
                      item-title="label"
                      item-value="value"
                      :items="queryTypeOptions"
                      variant="outlined"
                    />
                  </template>

                  <template #item.htmlType="{ item }">
                    <VSelect
                      v-model="item.htmlType"
                      density="compact"
                      hide-details
                      item-title="label"
                      item-value="value"
                      :items="htmlTypeOptions"
                      variant="outlined"
                    />
                  </template>

                  <template #item.dictType="{ item }">
                    <VSelect
                      v-model="item.dictType"
                      clearable
                      density="compact"
                      hide-details
                      item-title="dictName"
                      item-value="dictType"
                      :items="dictOptions"
                      variant="outlined"
                    />
                  </template>
                </VDataTable>
              </div>
            </div>
          </VForm>
        </VCardText>
      </template>

      <VCardText v-else class="py-10 text-center text-sm opacity-60">
        {{ $t('page.gen.edit.loadFailed') }}
      </VCardText>

      <VDivider />

      <VCardActions class="justify-end">
        <VBtn :disabled="saving" variant="text" @click="visible = false">
          {{ $t('common.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          :disabled="saving || loading || !info"
          :loading="saving"
          @click="handleSubmit"
        >
          {{ $t('common.save') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
