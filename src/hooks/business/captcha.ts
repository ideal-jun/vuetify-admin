import { computed, onScopeDispose, ref } from 'vue';

import { REG_PHONE } from '@/constants/reg';
import { $t } from '@/locales';

export type CaptchaRequest = (phone: string) => Promise<boolean>;

export function useCaptcha(request?: CaptchaRequest) {
  const loading = ref(false);
  const count = ref(0);
  const isCounting = ref(false);

  let timer: ReturnType<typeof setInterval> | null = null;

  const label = computed(() => {
    if (loading.value) {
      return '';
    }

    if (isCounting.value) {
      return $t('page.login.codeLogin.reGetCode', { time: count.value });
    }

    return $t('page.login.codeLogin.getCode');
  });

  function start() {
    stop();

    count.value = 10;
    isCounting.value = true;

    timer = setInterval(() => {
      count.value -= 1;

      if (count.value <= 0) {
        stop();
      }
    }, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    isCounting.value = false;
  }

  function isPhoneValid(phone: string) {
    if (phone.trim() === '') {
      window.$message?.error($t('form.phone.required'));

      return false;
    }

    if (!REG_PHONE.test(phone)) {
      window.$message?.error($t('form.phone.invalid'));

      return false;
    }

    return true;
  }

  async function getCaptcha(phone: string) {
    const valid = isPhoneValid(phone);

    if (!valid || loading.value || isCounting.value) {
      return false;
    }

    loading.value = true;

    try {
      const success = request ? await request(phone) : true;

      if (!success) {
        return false;
      }

      window.$message?.success($t('page.login.codeLogin.sendCodeSuccess'));

      start();

      return true;
    } finally {
      loading.value = false;
    }
  }

  onScopeDispose(() => {
    stop();
  });

  return {
    label,
    count,
    start,
    stop,
    isCounting,
    loading,
    isPhoneValid,
    getCaptcha,
  };
}
