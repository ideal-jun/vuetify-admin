import { ref, toValue } from 'vue';
import type { ComputedRef, Ref } from 'vue';

import { REG_CODE_SIX, REG_EMAIL, REG_PHONE, REG_PWD, REG_USER_NAME } from '@/constants/reg';
import { $t } from '@/locales';

export interface VuetifyFormInstance {
  validate: () => Promise<{ valid: boolean; errors: unknown[] }>;
  resetValidation: () => void;
  reset: () => void;
}

export function useFormRules() {
  const patternRules = {
    userName: {
      pattern: REG_USER_NAME,
      message: $t('form.userName.invalid'),
    },
    phone: {
      pattern: REG_PHONE,
      message: $t('form.phone.invalid'),
    },
    pwd: {
      pattern: REG_PWD,
      message: $t('form.pwd.invalid'),
    },
    code: {
      pattern: REG_CODE_SIX,
      message: $t('form.code.invalid'),
    },
    email: {
      pattern: REG_EMAIL,
      message: $t('form.email.invalid'),
    },
  };

  function createRequiredRule(message: string): App.Global.FormRule {
    return (value: unknown) => {
      if (value === null || value === undefined || String(value).trim() === '') {
        return message;
      }

      return true;
    };
  }

  function createPatternRule(pattern: RegExp, message: string): App.Global.FormRule {
    return (value: unknown) => {
      if (value === null || value === undefined || String(value).trim() === '') {
        return true;
      }

      return pattern.test(String(value)) ? true : message;
    };
  }

  const formRules = {
    userName: [
      createRequiredRule($t('form.userName.required')),
      createPatternRule(patternRules.userName.pattern, patternRules.userName.message),
    ],
    phone: [
      createRequiredRule($t('form.phone.required')),
      createPatternRule(patternRules.phone.pattern, patternRules.phone.message),
    ],
    pwd: [
      createRequiredRule($t('form.pwd.required')),
      createPatternRule(patternRules.pwd.pattern, patternRules.pwd.message),
    ],
    code: [
      createRequiredRule($t('form.code.required')),
      createPatternRule(patternRules.code.pattern, patternRules.code.message),
    ],
    email: [
      createRequiredRule($t('form.email.required')),
      createPatternRule(patternRules.email.pattern, patternRules.email.message),
    ],
  } satisfies Record<string, App.Global.FormRule[]>;

  /** The default required rule */
  const defaultRequiredRule = createRequiredRule($t('form.required'));

  /** Create a rule for confirming the password */
  function createConfirmPwdRule(pwd: string | Ref<string> | ComputedRef<string>) {
    return [
      createRequiredRule($t('form.confirmPwd.required')),
      (value: unknown): true | string => {
        const password = toValue(pwd);

        if (String(value ?? '').trim() !== '' && value !== password) {
          return $t('form.confirmPwd.invalid');
        }

        return true;
      },
    ] satisfies App.Global.FormRule[];
  }

  return {
    patternRules,
    formRules,
    defaultRequiredRule,
    createRequiredRule,
    createPatternRule,
    createConfirmPwdRule,
  };
}

/** A small wrapper around the Vuetify form instance */
export function useVuetifyForm() {
  const formRef = ref<VuetifyFormInstance | null>(null);

  async function validate() {
    return formRef.value?.validate();
  }

  function resetValidation() {
    formRef.value?.resetValidation();
  }

  function reset() {
    formRef.value?.reset();
  }

  return {
    formRef,
    validate,
    resetValidation,
    reset,
  };
}
