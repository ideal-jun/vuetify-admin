<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { enableStatusOptions, userSexOptions } from '@/constants/business';
import { REG_EMAIL, REG_PHONE, REG_PWD } from '@/constants/reg';
import { env } from '@/env';
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
  /** The role options, the values are backend role ids */
  roleOptions: CommonType.Option<number>[];
}

const { operateType, rowData, roleOptions } = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemManage.UserForm>(createDefaultModel());

const showPasswordField = computed(() => operateType === 'add');

const title = computed(() =>
  operateType === 'add' ? $t('page.system.user.add') : $t('page.system.user.edit'),
);

const sexOptions = computed(() => translateOptions(userSexOptions));

const statusOptions = computed(() => translateOptions(enableStatusOptions));

const rules = computed(() => {
  const { createRequiredRule, createPatternRule } = useFormRules();

  return {
    userName: [createRequiredRule($t('form.userName.required'))],
    phonenumber: createPatternRule(REG_PHONE, $t('form.phone.invalid')),
    email: createPatternRule(REG_EMAIL, $t('form.email.invalid')),
    password: [
      createRequiredRule($t('form.pwd.required')),
      createPatternRule(REG_PWD, $t('form.pwd.invalid')),
    ],
  };
});

function createDefaultModel(): Api.SystemManage.UserForm {
  return {
    userName: '',
    nickName: '',
    sex: '2',
    phonenumber: '',
    email: '',
    status: '0',
    roleIds: [],
    password: env.defaultUserPassword,
  };
}

function initModel() {
  if (operateType === 'edit' && rowData) {
    const { userName, nickName, sex, phonenumber, email, status, roleIds, roles } = rowData;

    model.value = {
      userName,
      nickName,
      sex: sex ?? '2',
      phonenumber: phonenumber ?? '',
      email: email ?? '',
      status: status ?? '0',
      roleIds: roleIds ?? roles?.map((role) => role.roleId) ?? [],
      password: '',
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
      const payload: Api.SystemManage.CreateUser = { ...model.value };

      payload.password = payload.password || env.defaultUserPassword;

      const { error } = await fetchCreateUser(payload);

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!rowData) {
        return;
      }

      const payload: Api.SystemManage.UpdateUser = {
        ...model.value,
        userId: rowData.userId,
      };

      delete payload.password;

      const { error } = await fetchUpdateUser(payload);

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

            <VTextField
              v-if="showPasswordField"
              v-model="model.password"
              :label="$t('page.system.user.form.password')"
              prepend-inner-icon="mdi-lock-outline"
              :rules="rules.password"
              type="password"
            />

            <VTextField
              v-model="model.nickName"
              :label="$t('page.system.user.columns.nickName')"
              :placeholder="$t('page.system.user.form.nickName')"
              prepend-inner-icon="mdi-account-edit-outline"
            />

            <VSelect
              v-model="model.sex"
              item-title="label"
              item-value="value"
              :items="sexOptions"
              :label="$t('page.system.user.columns.sex')"
              :placeholder="$t('page.system.user.form.sex')"
              prepend-inner-icon="mdi-gender-male-female"
            />

            <VTextField
              v-model="model.phonenumber"
              :label="$t('page.system.user.columns.phonenumber')"
              :placeholder="$t('page.system.user.form.phonenumber')"
              prepend-inner-icon="mdi-cellphone"
              :rules="[rules.phonenumber]"
            />

            <VTextField
              v-model="model.email"
              :label="$t('page.system.user.email')"
              :placeholder="$t('page.system.user.form.email')"
              prepend-inner-icon="mdi-email-outline"
              :rules="[rules.email]"
            />

            <VSelect
              v-model="model.roleIds"
              chips
              closable-chips
              item-title="label"
              item-value="value"
              :items="roleOptions"
              :label="$t('page.system.user.form.roleIds')"
              multiple
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
