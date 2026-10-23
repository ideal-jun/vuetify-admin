<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions } from '@/constants/business';
import { REG_ROLE_CODE } from '@/constants/reg';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchCreateRole, fetchUpdateRole } from '@/service/api';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'RoleOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemManage.Role | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemManage.RoleForm>(createDefaultModel());

const title = computed(() =>
  props.operateType === 'add' ? $t('page.system.role.add') : $t('page.system.role.edit'),
);

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const rules = computed(() => {
  const { createRequiredRule, createPatternRule } = useFormRules();

  return {
    roleName: createRequiredRule($t('form.roleName.required')),
    roleCode: [
      createRequiredRule($t('form.roleCode.required')),
      createPatternRule(REG_ROLE_CODE, $t('form.roleCode.invalid')),
    ],
  };
});

function createDefaultModel(): Api.SystemManage.RoleForm {
  return {
    roleName: '',
    roleCode: '',
    roleDesc: '',
    status: '1',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const { roleName, roleCode, roleDesc, status } = props.rowData;

    model.value = {
      roleName,
      roleCode,
      roleDesc,
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
    const payload: Api.SystemManage.RoleForm = { ...model.value };

    if (props.operateType === 'add') {
      const { error } = await fetchCreateRole(payload);

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!props.rowData) {
        return;
      }

      const { error } = await fetchUpdateRole({ ...payload, id: props.rowData.id });

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
    class="role-operate-drawer"
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
          <div class="mt-1 text-xs opacity-50">{{ $t('page.system.role.drawerDesc') }}</div>
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
              v-model="model.roleName"
              :label="$t('page.system.role.columns.roleName')"
              :placeholder="$t('page.system.role.form.roleName')"
              prepend-inner-icon="mdi-shield-account-outline"
              required
              :rules="[rules.roleName]"
            />

            <VTextField
              v-model="model.roleCode"
              :label="$t('page.system.role.columns.roleCode')"
              :placeholder="$t('page.system.role.form.roleCode')"
              prepend-inner-icon="mdi-identifier"
              required
              :rules="rules.roleCode"
            />

            <VTextarea
              v-model="model.roleDesc"
              auto-grow
              :label="$t('page.system.role.columns.roleDesc')"
              :placeholder="$t('page.system.role.form.roleDesc')"
              rows="3"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.system.role.columns.status') }}
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
