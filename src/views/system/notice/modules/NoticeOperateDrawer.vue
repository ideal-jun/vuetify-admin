<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchCreateNotice, fetchUpdateNotice } from '@/service/api/system-notice';

defineOptions({ name: 'NoticeOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemManage.Notice | null;
}

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
});

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemManage.NoticeForm>(createDefaultModel());

const title = computed(() =>
  props.operateType === 'add' ? $t('page.notice.add') : $t('page.notice.edit'),
);

const noticeTypeOptions = computed<CommonType.Option<Api.SystemManage.NoticeType>[]>(() => [
  { label: $t('page.notice.type.notice'), value: '1' },
  { label: $t('page.notice.type.announcement'), value: '2' },
]);

const noticeStatusOptions = computed<CommonType.Option<Api.SystemManage.NoticeStatus>[]>(() => [
  { label: $t('page.notice.status.normal'), value: '0' },
  { label: $t('page.notice.status.closed'), value: '1' },
]);

const rules = computed(() => {
  const { createRequiredRule } = useFormRules();

  return {
    noticeTitle: [createRequiredRule($t('form.required'))],
    noticeContent: [createRequiredRule($t('form.required'))],
  };
});

function createDefaultModel(): Api.SystemManage.NoticeForm {
  return {
    noticeTitle: '',
    noticeType: '1',
    noticeContent: '',
    status: '0',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const { noticeTitle, noticeType, noticeContent, status } = props.rowData;

    model.value = {
      noticeTitle,
      noticeType,
      noticeContent: noticeContent ?? '',
      status,
    };

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
      const { error } = await fetchCreateNotice({ ...model.value });

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!props.rowData) {
        return;
      }

      const { error } = await fetchUpdateNotice({
        ...model.value,
        noticeId: props.rowData.noticeId,
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

watch(visible, (value) => {
  if (!value) {
    return;
  }

  initModel();
  resetValidation();
});
</script>

<template>
  <VNavigationDrawer
    v-model="visible"
    class="notice-operate-drawer"
    floating
    location="right"
    order="-1"
    temporary
    :width="mobile ? '100%' : 560"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-lg font-700">{{ title }}</div>
          <div class="mt-1 text-xs opacity-50">{{ $t('page.notice.drawerDesc') }}</div>
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
              v-model="model.noticeTitle"
              :label="$t('page.notice.columns.noticeTitle')"
              :placeholder="$t('page.notice.form.noticeTitle')"
              prepend-inner-icon="mdi-format-title"
              required
              :rules="rules.noticeTitle"
            />

            <VSelect
              v-model="model.noticeType"
              item-title="label"
              item-value="value"
              :items="noticeTypeOptions"
              :label="$t('page.notice.form.noticeType')"
              prepend-inner-icon="mdi-tag-outline"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">{{ $t('page.notice.columns.status') }}</div>

              <VRadioGroup v-model="model.status" hide-details inline>
                <VRadio
                  v-for="option in noticeStatusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>

            <VTextarea
              v-model="model.noticeContent"
              auto-grow
              :label="$t('page.notice.form.noticeContent')"
              rows="8"
              :rules="rules.noticeContent"
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
