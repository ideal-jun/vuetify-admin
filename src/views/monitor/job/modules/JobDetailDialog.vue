<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { $t } from '@/locales';
import { fetchGetJob } from '@/service/api/monitor-job';

import { formatDateTime } from './job-format';

defineOptions({ name: 'JobDetailDialog' });

interface Props {
  /** The job group options used to translate the group */
  jobGroupOptions: CommonType.Option<string>[];
}

const { jobGroupOptions } = defineProps<Props>();

const visible = defineModel<boolean>('visible', { required: true });

const jobId = defineModel<number | null>('jobId', { default: null });

const loading = ref(false);
const detail = ref<Api.MonitorJob.Job | null>(null);

const groupLabel = computed(
  () => jobGroupOptions.find((option) => option.value === detail.value?.jobGroup)?.label ?? '—',
);

const statusLabel = computed(() =>
  detail.value?.status === '0' ? $t('page.job.status.normal') : $t('page.job.status.paused'),
);

const nextValidTimeLabel = computed(() => formatDateTime(detail.value?.nextValidTime));

const misfirePolicyLabel = computed(() => {
  const policy = detail.value?.misfirePolicy;

  if (policy === '1') {
    return $t('page.job.misfirePolicy.immediate');
  }

  if (policy === '2') {
    return $t('page.job.misfirePolicy.once');
  }

  if (policy === '3') {
    return $t('page.job.misfirePolicy.abandon');
  }

  return '—';
});

const concurrentLabel = computed(() =>
  detail.value?.concurrent === '1'
    ? $t('page.job.concurrent.forbid')
    : $t('page.job.concurrent.allow'),
);

async function loadDetail() {
  if (!jobId.value) {
    detail.value = null;

    return;
  }

  loading.value = true;

  try {
    const { data, error } = await fetchGetJob(jobId.value);

    detail.value = error ? null : data;
  } finally {
    loading.value = false;
  }
}

watch(visible, (value) => {
  if (value) {
    void loadDetail();
  }
});
</script>

<template>
  <VDialog v-model="visible" max-width="720" scrollable>
    <VCard rounded="xl">
      <VCardTitle class="text-base font-600">{{ $t('page.job.detail.title') }}</VCardTitle>

      <VDivider />

      <VCardText class="py-5">
        <VProgressLinear v-if="loading" indeterminate />

        <VRow v-else-if="detail" density="comfortable">
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.jobId') }}</div>
            <div class="mt-1">{{ detail.jobId }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.jobName') }}</div>
            <div class="mt-1">{{ detail.jobName }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.jobGroup') }}</div>
            <div class="mt-1">{{ groupLabel }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.status') }}</div>
            <div class="mt-1">{{ statusLabel }}</div>
          </VCol>
          <VCol cols="12">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.invokeTarget') }}</div>
            <div class="mt-1 break-all">{{ detail.invokeTarget }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.cronExpression') }}</div>
            <div class="mt-1">{{ detail.cronExpression }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.nextValidTime') }}</div>
            <div class="mt-1">{{ nextValidTimeLabel }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.misfirePolicy') }}</div>
            <div class="mt-1">{{ misfirePolicyLabel }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.concurrent') }}</div>
            <div class="mt-1">{{ concurrentLabel }}</div>
          </VCol>
          <VCol cols="12">
            <div class="text-xs opacity-60">{{ $t('page.job.detail.createTime') }}</div>
            <div class="mt-1">{{ detail.createTime || '—' }}</div>
          </VCol>
        </VRow>

        <div v-else class="py-8 text-center text-sm opacity-60">{{ $t('page.job.empty') }}</div>
      </VCardText>

      <VDivider />

      <VCardActions class="justify-end">
        <VBtn variant="text" @click="visible = false">{{ $t('page.job.detail.close') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
