<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchCreateConfig, fetchUpdateConfig } from '@/service/api/system-config';

defineOptions({ name: 'ConfigOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.SystemManage.Config | null;
}

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
});

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.SystemManage.ConfigForm>(createDefaultModel());

const title = computed(() =>
  props.operateType === 'add' ? $t('page.config.add') : $t('page.config.edit'),
);

const configTypeOptions = computed<CommonType.Option<Api.SystemManage.ConfigType>[]>(() => [
  { label: $t('page.config.type.yes'), value: 'Y' },
  { label: $t('page.config.type.no'), value: 'N' },
]);

const rules = computed(() => {
  const { createRequiredRule } = useFormRules();

  return {
    configName: [createRequiredRule($t('form.required'))],
    configKey: [createRequiredRule($t('form.required'))],
    configValue: [createRequiredRule($t('form.required'))],
  };
});

function createDefaultModel(): Api.SystemManage.ConfigForm {
  return {
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'Y',
    remark: '',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const { configName, configKey, configValue, configType, remark } = props.rowData;

    model.value = {
      configName,
      configKey,
      configValue,
      configType,
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
    if (props.operateType === 'add') {
      const { error } = await fetchCreateConfig({ ...model.value });

      if (error) {
        return;
      }

      window.$message?.success($t('common.addSuccess'));
    } else {
      if (!props.rowData) {
        return;
      }

      const { error } = await fetchUpdateConfig({
        ...model.value,
        configId: props.rowData.configId,
      });

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
    class="config-operate-drawer"
    floating
    location="right"
    order="-1"
    temporary
    :width="mobile ? '100%' : 460"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-lg font-700">{{ title }}</div>
          <div class="mt-1 text-xs opacity-50">{{ $t('page.config.drawerDesc') }}</div>
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
              v-model="model.configName"
              :label="$t('page.config.columns.configName')"
              :placeholder="$t('page.config.form.configName')"
              prepend-inner-icon="mdi-cog-outline"
              required
              :rules="rules.configName"
            />

            <VTextField
              v-model="model.configKey"
              :label="$t('page.config.columns.configKey')"
              :placeholder="$t('page.config.form.configKey')"
              prepend-inner-icon="mdi-identifier"
              required
              :rules="rules.configKey"
            />

            <VTextarea
              v-model="model.configValue"
              auto-grow
              :label="$t('page.config.columns.configValue')"
              :placeholder="$t('page.config.form.configValue')"
              rows="3"
              :rules="rules.configValue"
            />

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.config.columns.configType') }}
              </div>

              <VRadioGroup v-model="model.configType" hide-details inline>
                <VRadio
                  v-for="option in configTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>

            <VTextarea
              v-model="model.remark"
              auto-grow
              :label="$t('page.config.remark')"
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
