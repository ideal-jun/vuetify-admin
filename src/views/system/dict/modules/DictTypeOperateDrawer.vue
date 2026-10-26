<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions } from '@/constants/business';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import {
  fetchCreateDictType,
  fetchGetDictTypeDetail,
  fetchUpdateDictType,
} from '@/service/api/system-dict';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'DictTypeOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemDict.DictType | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemDict.DictTypeForm>(createDefaultModel());

const title = computed(() =>
  props.operateType === 'add' ? $t('page.dict.type.add') : $t('page.dict.type.edit'),
);

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const rules = computed(() => {
  const { createRequiredRule } = useFormRules();

  return {
    dictName: [createRequiredRule($t('form.required'))],
    dictType: [createRequiredRule($t('form.required'))],
  };
});

function createDefaultModel(): Api.SystemDict.DictTypeForm {
  return {
    dictName: '',
    dictType: '',
    status: '0',
    remark: '',
  };
}

function applyRow(row: Api.SystemDict.DictType) {
  model.value = {
    dictName: row.dictName,
    dictType: row.dictType,
    status: row.status,
    remark: row.remark ?? '',
  };
}

async function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    applyRow(props.rowData);

    const { data: detail, error } = await fetchGetDictTypeDetail(props.rowData.dictId);

    if (!error && detail) {
      applyRow(detail);
    }

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
    if (props.operateType === 'add') {
      const { error } = await fetchCreateDictType({ ...model.value });

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!props.rowData) {
        return;
      }

      const { error } = await fetchUpdateDictType({
        ...model.value,
        dictId: props.rowData.dictId,
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

  await initModel();
  resetValidation();
});
</script>

<template>
  <VNavigationDrawer
    v-model="visible"
    class="dict-type-operate-drawer"
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
          <div class="mt-1 text-xs opacity-50">{{ $t('page.dict.type.title') }}</div>
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
              v-model="model.dictName"
              :label="$t('page.dict.type.form.dictName')"
              :placeholder="$t('page.dict.type.placeholder.dictName')"
              prepend-inner-icon="mdi-book-open-variant"
              required
              :rules="rules.dictName"
            />

            <VTextField
              v-model="model.dictType"
              :label="$t('page.dict.type.form.dictType')"
              :placeholder="$t('page.dict.type.placeholder.dictType')"
              prepend-inner-icon="mdi-identifier"
              required
              :rules="rules.dictType"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.dict.type.form.status') }}
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
              :label="$t('page.dict.type.form.remark')"
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
