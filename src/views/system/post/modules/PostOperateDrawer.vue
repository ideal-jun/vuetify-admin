<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions } from '@/constants/business';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchCreatePost, fetchUpdatePost } from '@/service/api/system-post';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'PostOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemManage.Post | null;
}

const { operateType, rowData = null } = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemManage.PostForm>(createDefaultModel());

const title = computed(() => (operateType === 'add' ? $t('page.post.add') : $t('page.post.edit')));

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const rules = computed(() => {
  const { createRequiredRule } = useFormRules();

  return {
    postCode: [createRequiredRule($t('form.required'))],
    postName: [createRequiredRule($t('form.required'))],
    postSort: [createRequiredRule($t('form.required'))],
  };
});

function createDefaultModel(): Api.SystemManage.PostForm {
  return {
    postCode: '',
    postName: '',
    postSort: 1,
    status: '0',
    remark: '',
  };
}

function initModel() {
  if (operateType === 'edit' && rowData) {
    const { postCode, postName, postSort, status, remark } = rowData;

    model.value = {
      postCode,
      postName,
      postSort,
      status,
      remark: remark ?? '',
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
    if (operateType === 'add') {
      const { error } = await fetchCreatePost({ ...model.value });

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!rowData) {
        return;
      }

      const { error } = await fetchUpdatePost({ ...model.value, postId: rowData.postId });

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
    class="post-operate-drawer"
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
          <div class="mt-1 text-xs opacity-50">{{ $t('page.post.drawerDesc') }}</div>
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
              v-model="model.postCode"
              :label="$t('page.post.columns.postCode')"
              :placeholder="$t('page.post.form.postCode')"
              prepend-inner-icon="mdi-identifier"
              required
              :rules="rules.postCode"
            />

            <VTextField
              v-model="model.postName"
              :label="$t('page.post.columns.postName')"
              :placeholder="$t('page.post.form.postName')"
              prepend-inner-icon="mdi-badge-account-outline"
              required
              :rules="rules.postName"
            />

            <VTextField
              v-model.number="model.postSort"
              :label="$t('page.post.columns.postSort')"
              :placeholder="$t('page.post.form.postSort')"
              prepend-inner-icon="mdi-sort-numeric-ascending"
              required
              :rules="rules.postSort"
              type="number"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">{{ $t('page.post.columns.status') }}</div>

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
              :label="$t('page.post.remark')"
              :placeholder="$t('page.post.form.remark')"
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
