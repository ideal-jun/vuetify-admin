<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions } from '@/constants/business';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import {
  fetchCreateDictData,
  fetchGetDictDataDetail,
  fetchUpdateDictData,
} from '@/service/api/system-dict';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'DictDataOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemDict.DictData | null;
  /** The dictionary type the data belongs to */
  dictType: string;
}

interface DictDataModel extends Api.SystemDict.DictDataForm {
  dictCode?: number;
}

const { operateType, rowData, dictType } = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<DictDataModel>(createDefaultModel());

const title = computed(() =>
  operateType === 'add' ? $t('page.dict.data.add') : $t('page.dict.data.edit'),
);

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const listClassOptions = computed<CommonType.Option<string>[]>(() => [
  { value: 'default', label: $t('page.dict.data.listClass.default') },
  { value: 'primary', label: $t('page.dict.data.listClass.primary') },
  { value: 'success', label: $t('page.dict.data.listClass.success') },
  { value: 'info', label: $t('page.dict.data.listClass.info') },
  { value: 'warning', label: $t('page.dict.data.listClass.warning') },
  { value: 'danger', label: $t('page.dict.data.listClass.danger') },
]);

const rules = computed(() => {
  const { createRequiredRule } = useFormRules();

  return {
    dictLabel: [createRequiredRule($t('form.required'))],
    dictValue: [createRequiredRule($t('form.required'))],
  };
});

function createDefaultModel(): DictDataModel {
  return {
    dictType: dictType,
    dictLabel: '',
    dictValue: '',
    dictSort: 1,
    cssClass: '',
    listClass: 'default',
    status: '0',
    remark: '',
  };
}

function applyRow(row: Api.SystemDict.DictData) {
  model.value = {
    dictCode: row.dictCode,
    dictType: row.dictType,
    dictLabel: row.dictLabel,
    dictValue: row.dictValue,
    dictSort: row.dictSort,
    cssClass: row.cssClass ?? '',
    listClass: row.listClass ?? 'default',
    status: row.status,
    remark: row.remark ?? '',
  };
}

let initSequence = 0;

async function initModel(sequence: number) {
  if (operateType === 'edit' && rowData) {
    applyRow(rowData);

    const { data: detail, error } = await fetchGetDictDataDetail(rowData.dictCode);

    // A newer open owns the drawer now, this response is stale
    if (sequence !== initSequence || !rowData) {
      return;
    }

    if (!error && detail) {
      applyRow(detail);
    }

    return;
  }

  if (sequence !== initSequence) {
    return;
  }

  model.value = createDefaultModel();
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  const result = await validate();

  if (result && !result.valid) {
    return;
  }

  submitting.value = true;

  try {
    if (operateType === 'add') {
      const { error } = await fetchCreateDictData({
        dictType: model.value.dictType,
        dictLabel: model.value.dictLabel,
        dictValue: model.value.dictValue,
        dictSort: model.value.dictSort,
        cssClass: model.value.cssClass,
        listClass: model.value.listClass,
        status: model.value.status,
        remark: model.value.remark,
      });

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!rowData) {
        return;
      }

      const { error } = await fetchUpdateDictData({
        dictCode: rowData.dictCode,
        dictType: model.value.dictType,
        dictLabel: model.value.dictLabel,
        dictValue: model.value.dictValue,
        dictSort: model.value.dictSort,
        cssClass: model.value.cssClass,
        listClass: model.value.listClass,
        status: model.value.status,
        remark: model.value.remark,
      });

      if (error) {
        return;
      }

      window.$message?.success($t('common.updateSuccess'));
    }

    closeDrawer();
    emit('submitted');
  } finally {
    submitting.value = false;
  }
}

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  const sequence = ++initSequence;

  await initModel(sequence);

  if (sequence !== initSequence) {
    return;
  }

  resetValidation();
});

watch(
  () => dictType,
  (dictType) => {
    if (operateType === 'add') {
      model.value.dictType = dictType;
    }
  },
);
</script>

<template>
  <VNavigationDrawer
    v-model="visible"
    class="dict-data-operate-drawer"
    floating
    location="right"
    order="-1"
    temporary
    :width="mobile ? '100%' : 440"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-lg font-700">{{ title }}</div>
          <div class="mt-1 text-xs opacity-50">{{ $t('page.dict.data.title') }}</div>
        </div>

        <VBtn
          :aria-label="$t('common.close')"
          :disabled="submitting"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="closeDrawer"
        />
      </div>

      <VDivider />

      <div class="flex-1 overflow-y-auto px-5 py-5">
        <VForm ref="formRef" :model="model" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-4">
            <VTextField
              v-model="model.dictType"
              disabled
              :label="$t('page.dict.data.form.dictType')"
              prepend-inner-icon="mdi-identifier"
            />

            <VTextField
              v-model="model.dictLabel"
              :label="$t('page.dict.data.form.dictLabel')"
              :placeholder="$t('page.dict.data.placeholder.dictLabel')"
              prepend-inner-icon="mdi-tag-outline"
              required
              :rules="rules.dictLabel"
            />

            <VTextField
              v-model="model.dictValue"
              :label="$t('page.dict.data.form.dictValue')"
              :placeholder="$t('page.dict.data.placeholder.dictValue')"
              prepend-inner-icon="mdi-code-string"
              required
              :rules="rules.dictValue"
            />

            <VTextField
              v-model.number="model.dictSort"
              :label="$t('page.dict.data.form.dictSort')"
              :placeholder="$t('page.dict.data.placeholder.dictSort')"
              prepend-inner-icon="mdi-sort-numeric-ascending"
              type="number"
            />

            <VTextField
              v-model="model.cssClass"
              :label="$t('page.dict.data.form.cssClass')"
              :placeholder="$t('page.dict.data.placeholder.cssClass')"
              prepend-inner-icon="mdi-language-css3"
            />

            <VSelect
              v-model="model.listClass"
              item-title="label"
              item-value="value"
              :items="listClassOptions"
              :label="$t('page.dict.data.form.listClass')"
              prepend-inner-icon="mdi-tag-multiple-outline"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.dict.data.form.status') }}
              </div>

              <VRadioGroup v-model="model.status" hide-details inline>
                <VRadio
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>

            <VTextarea
              v-model="model.remark"
              auto-grow
              :label="$t('page.dict.data.form.remark')"
              rows="3"
            />
          </div>
        </VForm>
      </div>

      <VDivider />

      <div class="flex justify-end gap-2 px-5 py-4">
        <VBtn :disabled="submitting" variant="text" @click="closeDrawer">
          {{ $t('common.cancel') }}
        </VBtn>
        <VBtn color="primary" :disabled="submitting" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </VBtn>
      </div>
    </div>
  </VNavigationDrawer>
</template>
