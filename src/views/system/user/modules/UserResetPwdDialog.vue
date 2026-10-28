<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { env } from '@/env';
import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchResetUserPwd } from '@/service/api/system-manage';

defineOptions({ name: 'UserResetPwdDialog' });

interface Props {
  user?: Api.SystemManage.User | null;
}

const { user } = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { formRef, validate, resetValidation } = useVuetifyForm();

const { createRequiredRule } = useFormRules();

const submitting = ref(false);

const password = ref(env.defaultUserPassword);

const title = computed(() => $t('page.system.user.resetPwdTitle'));

const description = computed(() =>
  $t('page.system.user.resetPwdDesc', { userName: user?.userName ?? '' }),
);

const rules = computed(() => ({
  password: [createRequiredRule($t('form.pwd.required'))],
}));

watch(visible, (value) => {
  if (!value) {
    return;
  }

  password.value = env.defaultUserPassword;
  resetValidation();
});

async function handleSubmit() {
  if (!user) {
    return;
  }

  const result = await validate();

  if (!result?.valid) {
    return;
  }

  submitting.value = true;

  const { error } = await fetchResetUserPwd({
    userId: user.userId,
    password: password.value,
  });

  submitting.value = false;

  if (error) {
    return;
  }

  window.$message?.success($t('page.system.user.resetPwdSuccess'));
  visible.value = false;
  emit('submitted');
}
</script>

<template>
  <VDialog v-model="visible" max-width="440">
    <VCard>
      <VCardTitle>{{ title }}</VCardTitle>

      <VCardText>
        <p class="mb-4 text-sm text-medium-emphasis">{{ description }}</p>

        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VTextField
            v-model="password"
            :label="$t('page.system.user.newPassword')"
            prepend-inner-icon="mdi-lock-outline"
            :rules="rules.password"
            type="password"
          />
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn :disabled="submitting" variant="text" @click="visible = false">
          {{ $t('common.cancel') }}
        </VBtn>
        <VBtn color="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
