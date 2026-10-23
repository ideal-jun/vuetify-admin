<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useCaptcha } from '@/hooks/business/captcha';
import { useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchResetPassword, fetchSendCaptcha } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { localStg } from '@/utils/storage';

defineOptions({ name: 'Login' });

interface LoginForm {
  userName: string;
  password: string;
  phone: string;
  code: string;
  rememberMe: boolean;
}

const demoAccounts = [
  { userName: 'admin', phone: '13800000001' },
  { userName: 'Soybean', phone: '13800000002' },
  { userName: 'User', phone: '13800000003' },
];

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();
const themeStore = useThemeStore();
const { formRules } = useFormRules();
const {
  label: captchaLabel,
  loading: captchaLoading,
  isCounting: captchaCounting,
  getCaptcha,
} = useCaptcha(async (phone) => {
  const { data, error } = await fetchSendCaptcha(phone);

  return Boolean(!error && data?.sent);
});

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);

const remembered = localStg.get('loginRememberMe') === true;

const form = reactive<LoginForm>({
  userName: (remembered && localStg.get('loginUserName')) || 'admin',
  password: '123456',
  phone: (remembered && localStg.get('loginPhone')) || '',
  code: '',
  rememberMe: remembered,
});

const forgotDialogVisible = ref(false);
const resetAccount = ref('');
const resetLoading = ref(false);

const activeModule = computed<UnionKey.LoginModule>(() => {
  const module = route.params.module;

  if (module === 'code-login') {
    return 'code-login';
  }

  return 'pwd-login';
});

const isPwdLogin = computed(() => activeModule.value === 'pwd-login');

watch(
  () => activeModule.value,
  () => {
    formRef.value?.resetValidation();
  },
);

function switchModule(module: UnionKey.LoginModule) {
  void router.replace({ name: 'login', params: { module }, query: route.query });
}

function fillDemo(userName: string) {
  const account = demoAccounts.find((item) => item.userName === userName);

  form.userName = userName;
  form.password = '123456';
  form.phone = account?.phone ?? '';
}

function saveLoginPreference() {
  if (form.rememberMe) {
    localStg.set('loginRememberMe', true);
    localStg.set('loginUserName', form.userName);
    localStg.set('loginPhone', form.phone);

    return;
  }

  localStg.remove('loginRememberMe');
  localStg.remove('loginUserName');
  localStg.remove('loginPhone');
}

async function handleSubmit() {
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  const success = isPwdLogin.value
    ? await authStore.login(form.userName, form.password)
    : await authStore.loginByCode(form.phone, form.code);

  if (success) {
    if (!isPwdLogin.value) {
      form.userName = authStore.userInfo.userName;
    }

    saveLoginPreference();
  }
}

async function sendCode() {
  await getCaptcha(form.phone);
}

function openForgotDialog() {
  resetAccount.value =
    (isPwdLogin.value ? form.userName : form.phone) || form.userName || form.phone;
  forgotDialogVisible.value = true;
}

async function handleResetPassword() {
  const account = resetAccount.value.trim();

  if (!account) {
    window.$message?.error($t('page.login.common.accountRequired'));

    return;
  }

  resetLoading.value = true;

  try {
    const { data, error } = await fetchResetPassword(account);

    if (!error && data?.sent) {
      window.$message?.success($t('page.login.common.resetPasswordSent'));
      forgotDialogVisible.value = false;
    }
  } finally {
    resetLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex bg-layout">
    <div class="login-brand relative hidden flex-1 overflow-hidden lg:flex">
      <div class="login-brand__glow login-brand__glow--one" />
      <div class="login-brand__glow login-brand__glow--two" />

      <div class="relative z-10 h-full flex flex-col justify-between p-12">
        <div class="flex items-center gap-3">
          <SystemLogo class="size-10" />
          <span class="text-xl text-white font-700">{{ $t('system.title') }}</span>
        </div>

        <div class="max-w-md">
          <h1 class="text-5xl text-white font-800 leading-tight">
            {{ $t('system.title') }}
          </h1>
          <p class="mt-4 text-base text-white/70 leading-7">{{ $t('system.desc') }}</p>

          <div class="mt-10 flex flex-col gap-3">
            <div
              v-for="feature in ['TypeScript', 'Vuetify 4', 'Theme system', 'Route & tab cache']"
              :key="feature"
              class="flex items-center gap-3 text-sm text-white/80"
            >
              <VIcon class="text-white/80" icon="mdi-check-circle-outline" size="18" />
              {{ feature }}
            </div>
          </div>
        </div>

        <div class="text-xs text-white/40">Copyright MIT © 2021-2026 Vuetify Admin</div>
      </div>
    </div>

    <div class="flex flex-1 flex-col bg-container px-6 py-6">
      <div class="flex justify-end gap-2">
        <LangSwitch
          :lang="appStore.locale"
          :lang-options="appStore.localeOptions"
          @change-lang="appStore.changeLocale"
        />
        <ThemeSchemaSwitch
          :theme-schema="themeStore.themeScheme"
          @switch="themeStore.toggleThemeScheme"
        />
      </div>

      <div class="m-auto w-full max-w-[400px] py-8">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <SystemLogo class="size-9" />
          <span class="text-lg font-700">{{ $t('system.title') }}</span>
        </div>

        <h2 class="text-2xl text-base-text font-700">{{ $t('page.login.common.welcome') }}</h2>
        <p class="mt-1 text-sm opacity-50">{{ $t('system.desc') }}</p>

        <VTabs
          class="mt-6"
          color="primary"
          :model-value="activeModule"
          @update:model-value="(value) => switchModule(value as UnionKey.LoginModule)"
        >
          <VTab class="text-none" value="pwd-login">{{ $t('page.login.pwdLogin.title') }}</VTab>
          <VTab class="text-none" value="code-login">{{ $t('page.login.codeLogin.title') }}</VTab>
        </VTabs>

        <VForm ref="formRef" class="mt-6" @submit.prevent="handleSubmit">
          <template v-if="isPwdLogin">
            <VTextField
              v-model="form.userName"
              autocomplete="username"
              class="mb-3"
              :label="$t('page.login.common.account')"
              :placeholder="$t('page.login.common.userNamePlaceholder')"
              prepend-inner-icon="mdi-account-outline"
              :rules="formRules.userName"
            />

            <VTextField
              v-model="form.password"
              autocomplete="current-password"
              class="mb-2"
              :label="$t('page.login.common.password')"
              :placeholder="$t('page.login.common.passwordPlaceholder')"
              prepend-inner-icon="mdi-lock-outline"
              :rules="formRules.pwd"
              type="password"
            />
          </template>

          <template v-else>
            <VTextField
              v-model="form.phone"
              class="mb-3"
              :label="$t('page.login.common.phonePlaceholder')"
              prepend-inner-icon="mdi-cellphone"
              :rules="formRules.phone"
            />

            <div class="mb-3 flex gap-2">
              <VTextField
                v-model="form.code"
                class="flex-1"
                :label="$t('page.login.common.codePlaceholder')"
                prepend-inner-icon="mdi-shield-key-outline"
                :rules="formRules.code"
              />

              <VBtn
                class="mt-1"
                color="primary"
                :disabled="captchaLoading || captchaCounting"
                variant="tonal"
                @click="sendCode"
              >
                {{ captchaLabel || $t('page.login.codeLogin.getCode') }}
              </VBtn>
            </div>

            <div class="mb-3 text-xs opacity-50">
              {{ $t('page.login.codeLogin.demoCode') }}
            </div>
          </template>

          <div class="mb-5 flex items-center justify-between">
            <VCheckbox
              v-model="form.rememberMe"
              color="primary"
              density="compact"
              hide-details
              :label="$t('page.login.common.rememberMe')"
            />
            <VBtn class="text-primary" size="small" variant="text" @click="openForgotDialog">
              {{ $t('page.login.common.forgotPassword') }}
            </VBtn>
          </div>

          <VBtn
            block
            color="primary"
            :loading="authStore.loginLoading"
            rounded="lg"
            size="large"
            @click="handleSubmit"
          >
            {{ $t('page.login.common.loginButton') }}
          </VBtn>
        </VForm>

        <div class="mt-6 rounded-2xl bg-primary/5 p-4">
          <div class="mb-2 flex items-center gap-2 text-xs font-600 text-primary">
            <VIcon icon="mdi-information-outline" size="16" />
            {{ $t('page.login.common.demoHint') }}
          </div>

          <div class="flex flex-wrap gap-2">
            <VChip
              v-for="account in demoAccounts"
              :key="account.userName"
              class="cursor-pointer"
              color="primary"
              size="small"
              variant="tonal"
              @click="fillDemo(account.userName)"
            >
              {{ account.userName }}
            </VChip>
          </div>
        </div>
      </div>

      <div class="text-center text-xs opacity-40">© 2021-2026 Vuetify Admin</div>
    </div>

    <VDialog v-model="forgotDialogVisible" max-width="420">
      <VCard rounded="xl">
        <VCardTitle class="text-base font-600">
          {{ $t('page.login.common.resetPasswordTitle') }}
        </VCardTitle>

        <VCardText>
          <p class="mb-4 text-sm opacity-60">
            {{ $t('page.login.common.resetPasswordTip') }}
          </p>

          <VTextField
            v-model="resetAccount"
            autofocus
            :label="$t('page.login.common.resetPasswordAccount')"
            prepend-inner-icon="mdi-account-search-outline"
            @keyup.enter="handleResetPassword"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="forgotDialogVisible = false">
            {{ $t('common.cancel') }}
          </VBtn>
          <VBtn color="primary" :loading="resetLoading" @click="handleResetPassword">
            {{ $t('page.login.common.resetPasswordSend') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.login-brand {
  background:
    radial-gradient(circle at 20% 15%, rgba(var(--v-theme-primary), 45%), transparent 42%),
    linear-gradient(135deg, #101322 0%, #1a1f36 45%, #121829 100%);
}

.login-brand__glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(10px);
  opacity: 0.55;
}

.login-brand__glow--one {
  top: -120px;
  right: -80px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 70%), transparent 65%);
}

.login-brand__glow--two {
  bottom: -140px;
  left: -100px;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(var(--v-theme-info), 60%), transparent 65%);
}
</style>
