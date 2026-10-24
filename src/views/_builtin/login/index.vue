<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import LangSwitch from '@/components/common/LangSwitch.vue';
import SystemLogo from '@/components/common/SystemLogo.vue';
import ThemeSchemaSwitch from '@/components/common/ThemeSchemaSwitch.vue';
import { env } from '@/env';
import { useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchGetCaptcha } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { localStg } from '@/utils/storage';

defineOptions({ name: 'Login' });

interface LoginForm {
  userName: string;
  password: string;
  code: string;
  rememberMe: boolean;
}

/** The captcha fields the login form keeps, the backend response also carries code/msg */
interface CaptchaState {
  img: string;
  uuid: string;
  captchaEnabled: boolean;
}

const authStore = useAuthStore();
const appStore = useAppStore();
const themeStore = useThemeStore();
const { formRules, createRequiredRule } = useFormRules();

const captcha = reactive<CaptchaState>({
  img: '',
  uuid: '',
  captchaEnabled: false,
});

const captchaLoading = ref(false);

const captchaImage = computed(() => (captcha.img ? `data:image/jpeg;base64,${captcha.img}` : ''));

/** The RuoYi captcha is not always a 6-digit SMS code, so only require a non-empty value */
const captchaRules = computed(() => [createRequiredRule($t('form.code.required'))]);

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);

const remembered = localStg.get('loginRememberMe') === true;

const form = reactive<LoginForm>({
  userName: (remembered && localStg.get('loginUserName')) || 'admin',
  password: env.defaultUserPassword,
  code: '',
  rememberMe: remembered,
});

/** Load or refresh the image captcha of the RuoYi backend */
async function loadCaptcha() {
  captchaLoading.value = true;

  try {
    const { data, error } = await fetchGetCaptcha();

    if (error) {
      return;
    }

    if (data) {
      captcha.img = data.img;
      captcha.uuid = data.uuid;
      captcha.captchaEnabled = data.captchaEnabled;
    }
  } finally {
    captchaLoading.value = false;
  }
}

onMounted(() => {
  void loadCaptcha();
});

function saveLoginPreference() {
  if (form.rememberMe) {
    localStg.set('loginRememberMe', true);
    localStg.set('loginUserName', form.userName);

    return;
  }

  localStg.remove('loginRememberMe');
  localStg.remove('loginUserName');
}

async function handleSubmit() {
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  const captchaPayload = captcha.captchaEnabled
    ? { code: form.code, uuid: captcha.uuid }
    : undefined;

  const success = await authStore.login(form.userName, form.password, captchaPayload);

  if (success) {
    saveLoginPreference();

    return;
  }

  // The captcha is single-use on the backend, fetch a fresh one and keep the form values.
  if (captcha.captchaEnabled) {
    form.code = '';
    await loadCaptcha();
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

        <VForm ref="formRef" class="mt-6" @submit.prevent="handleSubmit">
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

          <div v-if="captcha.captchaEnabled" class="mb-3 flex items-start gap-2">
            <VTextField
              v-model="form.code"
              class="flex-1"
              :label="$t('page.login.common.captchaPlaceholder')"
              prepend-inner-icon="mdi-shield-key-outline"
              :rules="captchaRules"
            />

            <button
              :aria-label="$t('page.login.common.captchaRefresh')"
              class="captcha-image mt-1"
              type="button"
              @click="loadCaptcha"
            >
              <img
                v-if="captchaImage"
                :alt="$t('page.login.common.captchaRefresh')"
                :src="captchaImage"
              />
              <span v-else class="captcha-image__placeholder">
                <VProgressCircular indeterminate size="20" />
              </span>
            </button>

            <VBtn
              class="mt-1"
              :disabled="captchaLoading"
              icon="mdi-refresh"
              :loading="captchaLoading"
              size="small"
              variant="text"
              @click="loadCaptcha"
            />
          </div>

          <div class="mb-5 flex items-center justify-between">
            <VCheckbox
              v-model="form.rememberMe"
              color="primary"
              density="compact"
              hide-details
              :label="$t('page.login.common.rememberMe')"
            />
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

        <div
          class="mt-6 flex items-center gap-2 rounded-2xl bg-primary/5 p-4 text-xs text-primary font-600"
        >
          <VIcon icon="mdi-information-outline" size="16" />
          {{ $t('page.login.common.ruoyiDemoHint') }}
        </div>
      </div>

      <div class="text-center text-xs opacity-40">© 2021-2026 Vuetify Admin</div>
    </div>
  </div>
</template>

<style scoped>
.captcha-image {
  display: block;
  width: 104px;
  height: 40px;
  flex: none;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
}

.captcha-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-image__placeholder {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

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
