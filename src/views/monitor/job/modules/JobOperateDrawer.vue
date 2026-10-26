<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useFormRules, useVuetifyForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchCreateJob, fetchUpdateJob } from '@/service/api/monitor-job';
import { jsonClone } from '@/utils/common';

import { CRON_PRESETS } from './cron-presets';

defineOptions({ name: 'JobOperateDrawer' });

interface Props {
  /** The type of operation */
  operateType: 'add' | 'edit';
  /** The editing row data */
  rowData?: Api.MonitorJob.Job | null;
  /** The job group options */
  jobGroupOptions: CommonType.Option<string>[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();
const { formRef, validate, resetValidation } = useVuetifyForm();

const submitting = ref(false);

const model = ref<Api.MonitorJob.JobForm>(createDefaultModel());

const title = computed(() =>
  props.operateType === 'add' ? $t('page.job.add') : $t('page.job.edit'),
);

const misfirePolicyOptions = computed<CommonType.Option<string>[]>(() => [
  { label: $t('page.job.misfirePolicy.immediate'), value: '1' },
  { label: $t('page.job.misfirePolicy.once'), value: '2' },
  { label: $t('page.job.misfirePolicy.abandon'), value: '3' },
]);

const concurrentOptions = computed<CommonType.Option<string>[]>(() => [
  { label: $t('page.job.concurrent.allow'), value: '0' },
  { label: $t('page.job.concurrent.forbid'), value: '1' },
]);

const statusOptions = computed<CommonType.Option<Api.MonitorJob.JobStatus>[]>(() => [
  { label: $t('page.job.status.normal'), value: '0' },
  { label: $t('page.job.status.paused'), value: '1' },
]);

const cronPresetOptions = computed(() =>
  CRON_PRESETS.map((preset) => ({
    ...preset,
    label: $t(`page.job.cronPresets.${preset.key}` as App.I18n.I18nKey),
  })),
);

const rules = computed(() => {
  const required = useFormRules().createRequiredRule($t('form.required'));

  return {
    jobName: [required],
    invokeTarget: [required],
    cronExpression: [required],
  };
});

function createDefaultModel(): Api.MonitorJob.JobForm {
  return {
    jobName: '',
    jobGroup: 'DEFAULT',
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: '1',
    concurrent: '1',
    status: '0',
  };
}

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const { jobName, jobGroup, invokeTarget, cronExpression, misfirePolicy, concurrent, status } =
      props.rowData;

    model.value = {
      jobName,
      jobGroup,
      invokeTarget,
      cronExpression,
      misfirePolicy: misfirePolicy ?? '1',
      concurrent: concurrent ?? '1',
      status,
    };

    return;
  }

  model.value = createDefaultModel();
}

function closeDrawer() {
  visible.value = false;
}

function applyCronPreset(expression: string) {
  model.value.cronExpression = expression;
}

async function handleSubmit() {
  const result = await validate();

  if (result && !result.valid) {
    return;
  }

  submitting.value = true;

  try {
    const payload: Api.MonitorJob.JobForm = jsonClone(model.value);
    const { error } =
      props.operateType === 'add'
        ? await fetchCreateJob(payload)
        : await fetchUpdateJob({ ...payload, jobId: props.rowData?.jobId ?? 0 });

    if (error) {
      return;
    }

    window.$message?.success(
      props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'),
    );

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
    class="job-operate-drawer"
    floating
    location="right"
    order="-1"
    temporary
    :width="mobile ? '100%' : 520"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-lg font-700">{{ title }}</div>
          <div class="mt-1 text-xs opacity-50">{{ $t('page.job.drawerDesc') }}</div>
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
              v-model="model.jobName"
              :label="$t('page.job.form.jobName')"
              :placeholder="$t('page.job.form.jobNamePlaceholder')"
              prepend-inner-icon="mdi-calendar-clock-outline"
              required
              :rules="rules.jobName"
            />

            <VSelect
              v-model="model.jobGroup"
              item-title="label"
              item-value="value"
              :items="jobGroupOptions"
              :label="$t('page.job.form.jobGroup')"
              prepend-inner-icon="mdi-folder-outline"
            />

            <VTextField
              v-model="model.invokeTarget"
              :label="$t('page.job.form.invokeTarget')"
              :placeholder="$t('page.job.form.invokeTargetPlaceholder')"
              prepend-inner-icon="mdi-console"
              required
              :rules="rules.invokeTarget"
            />

            <div>
              <div class="mb-1.5 text-xs opacity-60">
                {{ $t('page.job.form.invokeTargetHint') }}
              </div>

              <VTextField
                v-model="model.cronExpression"
                :label="$t('page.job.form.cronExpression')"
                :placeholder="$t('page.job.form.cronExpressionPlaceholder')"
                prepend-inner-icon="mdi-clock-outline"
                required
                :rules="rules.cronExpression"
              >
                <template #append-inner>
                  <VMenu :close-on-content-click="false" location="bottom end">
                    <template #activator="{ props: activatorProps }">
                      <VBtn
                        v-bind="activatorProps"
                        :aria-label="$t('page.job.cronPresets.title')"
                        icon="mdi-format-list-bulleted"
                        size="small"
                        variant="text"
                      />
                    </template>

                    <VList density="compact" min-width="260">
                      <VListSubheader>{{ $t('page.job.cronPresets.title') }}</VListSubheader>
                      <VListItem
                        v-for="preset in cronPresetOptions"
                        :key="preset.key"
                        @click="applyCronPreset(preset.expression)"
                      >
                        <VListItemTitle>{{ preset.label }}</VListItemTitle>
                        <VListItemSubtitle>{{ preset.expression }}</VListItemSubtitle>
                      </VListItem>
                    </VList>
                  </VMenu>
                </template>
              </VTextField>
            </div>

            <div>
              <div class="mb-1.5 text-sm opacity-80">
                {{ $t('page.job.form.misfirePolicy') }}
              </div>

              <VRadioGroup v-model="model.misfirePolicy" hide-details inline>
                <VRadio
                  v-for="option in misfirePolicyOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>

            <div>
              <div class="mb-1.5 text-sm opacity-80">{{ $t('page.job.form.concurrent') }}</div>

              <VRadioGroup v-model="model.concurrent" hide-details inline>
                <VRadio
                  v-for="option in concurrentOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </VRadioGroup>
            </div>

            <div>
              <div class="mb-1.5 text-sm opacity-80">{{ $t('page.job.form.status') }}</div>

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
