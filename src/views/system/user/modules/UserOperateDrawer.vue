<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions, userGenderOptions } from '@/constants/business';
import { REG_EMAIL, REG_PHONE, REG_USER_NAME } from '@/constants/reg';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchCreateUser, fetchUpdateUser } from '@/service/api';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'UserOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemManage.User | null;
  /** The enabled role options */
  roleOptions: CommonType.Option<string>[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemManage.UserForm>(createDefaultModel());

const title = computed(() =>
  props.operateType === 'add' ? $t('page.system.user.add') : $t('page.system.user.edit'),
);

const genderOptions = computed(() => translateOptions(userGenderOptions));

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const rules = computed(() => {
  const { createRequiredRule, createPatternRule } = useFormRules();

  return {
    userName: [
      createRequiredRule($t('form.userName.required')),
      createPatternRule(REG_USER_NAME, $t('form.userName.invalid')),
    ],
    userPhone: createPatternRule(REG_PHONE, $t('form.phone.invalid')),
    userEmail: createPatternRule(REG_EMAIL, $t('form.email.invalid')),
  };
});

function createDefaultModel(): Api.SystemManage.UserForm {
  return {
    userName: '',
    userGender: null,
    nickName: '',
    userPhone: '',
    userEmail: '',
    userRoles: [],
    status: '1',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const { userName, userGender, nickName, userPhone, userEmail, userRoles, status } =
      props.rowData;

    model.value = {
      userName,
      userGender,
      nickName,
      userPhone,
      userEmail,
      userRoles: [...userRoles],
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
    const payload: Api.SystemManage.UserForm = { ...model.value };

    if (props.operateType === 'add') {
      const { error } = await fetchCreateUser(payload);

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!props.rowData) {
        return;
      }

      const { error } = await fetchUpdateUser({ ...payload, id: props.rowData.id });

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
    class="user-operate-drawer"
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
          <div class="mt-1 text-xs opacity-50">{{ $t('page.system.user.drawerDesc') }}</div>
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
              v-model="model.userName"
              :label="$t('page.system.user.columns.userName')"
              :placeholder="$t('page.system.user.form.userName')"
              prepend-inner-icon="mdi-account-outline"
              required
              :rules="rules.userName"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.system.user.columns.userGender') }}
              </div>

              <VRadioGroup v-model="model.userGender" hide-details inline>
                <VRadio
                  v-for="option in genderOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>

            <VTextField
              v-model="model.nickName"
              :label="$t('page.system.user.columns.nickName')"
              :placeholder="$t('page.system.user.form.nickName')"
              prepend-inner-icon="mdi-account-edit-outline"
            />

            <VTextField
              v-model="model.userPhone"
              :label="$t('page.system.user.columns.userPhone')"
              :placeholder="$t('page.system.user.form.userPhone')"
              prepend-inner-icon="mdi-cellphone"
              :rules="[rules.userPhone]"
            />

            <VTextField
              v-model="model.userEmail"
              :label="$t('page.system.user.columns.userEmail')"
              :placeholder="$t('page.system.user.form.userEmail')"
              prepend-inner-icon="mdi-email-outline"
              :rules="[rules.userEmail]"
            />

            <VSelect
              v-model="model.userRoles"
              chips
              closable-chips
              item-title="label"
              item-value="value"
              :items="roleOptions"
              :label="$t('page.system.user.columns.userRoles')"
              multiple
              :placeholder="$t('page.system.user.form.userRoles')"
              prepend-inner-icon="mdi-shield-account-outline"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.system.user.columns.status') }}
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

<style scoped></style>
