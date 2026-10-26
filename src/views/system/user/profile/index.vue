<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { userSexOptions } from '@/constants/business';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import {
  fetchGetProfile,
  fetchUpdateProfile,
  fetchUpdateProfilePwd,
} from '@/service/api/system-profile';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'Profile' });

type ProfileTab = 'basic' | 'password';

interface BasicForm {
  nickName: string;
  phonenumber: string;
  email: string;
  sex: Api.Backend.Sex;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const authStore = useAuthStore();
const router = useRouter();
const { createRequiredRule, createPatternRule, createConfirmPwdRule } = useFormRules();
const { formRef: basicFormRef, validate: validateBasic } = useVuetifyForm();
const { formRef: passwordFormRef, validate: validatePassword } = useVuetifyForm();

const activeTab = ref<ProfileTab>('basic');
const loading = ref(false);
const saving = ref(false);
const profile = ref<Api.Backend.Profile | null>(null);

const basicForm = reactive<BasicForm>({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '0',
});

const passwordForm = reactive<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const sexOptions = computed(() => userSexOptions);

const basicRules = computed(() => ({
  nickName: [createRequiredRule($t('page.profile.required'))],
  phonenumber: [createPatternRule(/^1[3-9]\d{9}$/u, $t('page.profile.invalidPhone'))],
  email: [createPatternRule(/^[\w.-]+@[\w.-]+\.\w+$/u, $t('page.profile.invalidEmail'))],
}));

const passwordRules = computed(() => ({
  oldPassword: [createRequiredRule($t('page.profile.required'))],
  newPassword: [createRequiredRule($t('page.profile.required'))],
  confirmPassword: createConfirmPwdRule(passwordForm.newPassword),
}));

async function loadProfile() {
  loading.value = true;

  const { data, error } = await fetchGetProfile();

  loading.value = false;

  if (error || !data) {
    return;
  }

  profile.value = data;

  basicForm.nickName = data.user.nickName ?? '';
  basicForm.phonenumber = data.user.phonenumber ?? '';
  basicForm.email = data.user.email ?? '';
  basicForm.sex = data.user.sex ?? '0';
}

async function saveBasic() {
  const result = await validateBasic();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  const { error } = await fetchUpdateProfile({ ...basicForm });

  saving.value = false;

  if (error) {
    return;
  }

  window.$message?.success($t('page.profile.saveSuccess'));

  await authStore.initUserInfo();
  await loadProfile();
}

async function savePassword() {
  const result = await validatePassword();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  const { error } = await fetchUpdateProfilePwd({
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword,
  });

  saving.value = false;

  if (error) {
    return;
  }

  window.$message?.success($t('page.profile.passwordSuccess'));

  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';

  passwordFormRef.value?.resetValidation();
}

function backToHome() {
  void router.push({ name: 'home' });
}

onMounted(() => {
  void loadProfile();
});
</script>

<template>
  <div class="flex-col-stretch gap-4">
    <VCard class="app-panel" variant="flat">
      <VCardText class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <VAvatar color="primary" size="72" variant="tonal">
          <VImg v-if="profile?.user.avatar" :src="profile.user.avatar" />
          <span v-else class="text-2xl font-700">
            {{ (profile?.user.nickName || profile?.user.userName || 'A').slice(0, 1) }}
          </span>
        </VAvatar>

        <div class="min-w-0 flex-1">
          <h2 class="text-title-large">{{ profile?.user.nickName || profile?.user.userName }}</h2>
          <p class="text-body-medium text-medium-emphasis">
            {{ profile?.user.userName }}
            <span v-if="profile?.roleGroup"> · {{ profile.roleGroup }}</span>
            <span v-if="profile?.postGroup"> · {{ profile.postGroup }}</span>
          </p>
        </div>

        <VBtn prepend-icon="mdi-arrow-left" variant="text" @click="backToHome">
          {{ $t('common.back') }}
        </VBtn>
      </VCardText>
    </VCard>

    <VCard class="app-panel" variant="flat">
      <VTabs v-model="activeTab" density="comfortable">
        <VTab value="basic">{{ $t('page.profile.basicInfo') }}</VTab>
        <VTab value="password">{{ $t('page.profile.changePassword') }}</VTab>
      </VTabs>

      <VDivider />

      <VCardText>
        <VWindow v-model="activeTab">
          <VWindowItem value="basic">
            <VForm ref="basicFormRef" :disabled="saving" @submit.prevent="saveBasic">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    disabled
                    :label="$t('page.profile.userName')"
                    :model-value="profile?.user.userName"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="basicForm.nickName"
                    :label="$t('page.profile.nickName')"
                    :rules="basicRules.nickName"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="basicForm.phonenumber"
                    :label="$t('page.profile.phonenumber')"
                    :rules="basicRules.phonenumber"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="basicForm.email"
                    :label="$t('page.profile.email')"
                    :rules="basicRules.email"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="basicForm.sex"
                    :items="sexOptions"
                    :label="$t('page.profile.sex')"
                  />
                </VCol>
                <VCol class="flex justify-end" cols="12">
                  <VBtn color="primary" :loading="saving" type="submit">
                    {{ $t('page.profile.save') }}
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VWindowItem>

          <VWindowItem value="password">
            <VForm ref="passwordFormRef" :disabled="saving" @submit.prevent="savePassword">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="passwordForm.oldPassword"
                    autocomplete="current-password"
                    :label="$t('page.profile.oldPassword')"
                    :rules="passwordRules.oldPassword"
                    type="password"
                  />
                </VCol>
                <VCol cols="12" md="6" />
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="passwordForm.newPassword"
                    autocomplete="new-password"
                    :label="$t('page.profile.newPassword')"
                    :rules="passwordRules.newPassword"
                    type="password"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="passwordForm.confirmPassword"
                    autocomplete="new-password"
                    :label="$t('page.profile.confirmPassword')"
                    :rules="passwordRules.confirmPassword"
                    type="password"
                  />
                </VCol>
                <VCol class="flex justify-end" cols="12">
                  <VBtn color="primary" :loading="saving" type="submit">
                    {{ $t('page.profile.updatePassword') }}
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </div>
</template>
