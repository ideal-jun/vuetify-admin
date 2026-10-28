<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

import { $t } from '@/locales';

import { getBusinessTypeLabel, operlogStatusRecord } from './shared';

defineOptions({ name: 'OperlogDetailDialog' });

const { row } = defineProps<{
  row: Api.SystemOperlog.Operlog | null;
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

const businessTypeLabel = computed(() => (row ? getBusinessTypeLabel(row.businessType) : '—'));

function closeDialog() {
  visible.value = false;
}
</script>

<template>
  <VDialog v-model="visible" :max-width="mobile ? '100%' : 960" scrollable>
    <VCard v-if="row">
      <VCardTitle class="text-base font-600">
        {{ $t('page.operlog.detail.title') }}
      </VCardTitle>

      <VDivider />

      <VCardText class="max-h-[70vh] overflow-y-auto">
        <VRow density="compact">
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.module') }}</div>
            <div class="mt-1 text-sm">{{ row.title }} / {{ businessTypeLabel }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.loginInfo') }}</div>
            <div class="mt-1 text-sm">{{ row.operName || '—' }} / {{ row.operIp || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.deptName') }}</div>
            <div class="mt-1 text-sm">{{ row.deptName || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operLocation') }}</div>
            <div class="mt-1 text-sm">{{ row.operLocation || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operUrl') }}</div>
            <div class="mt-1 break-all text-sm">{{ row.operUrl || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.requestMethod') }}</div>
            <div class="mt-1 text-sm">{{ row.requestMethod || '—' }} / {{ row.method || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.status') }}</div>
            <div class="mt-1">
              <VChip :color="row.status === '0' ? 'success' : 'error'" size="small" variant="tonal">
                {{ $t(operlogStatusRecord[row.status]) }}
              </VChip>
            </div>
          </VCol>

          <VCol cols="12" sm="3">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.costTime') }}</div>
            <div class="mt-1 text-sm">
              {{ $t('page.operlog.costTimeUnit', { value: row.costTime ?? 0 }) }}
            </div>
          </VCol>

          <VCol cols="12" sm="3">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operTime') }}</div>
            <div class="mt-1 text-sm">{{ row.operTime || '—' }}</div>
          </VCol>

          <VCol cols="12">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operParam') }}</div>
            <pre class="detail-code mt-1">{{ row.operParam || '—' }}</pre>
          </VCol>

          <VCol cols="12">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.jsonResult') }}</div>
            <pre class="detail-code mt-1">{{ row.jsonResult || '—' }}</pre>
          </VCol>

          <VCol v-if="row.status === '1' && row.errorMsg" cols="12">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.errorMsg') }}</div>
            <VAlert class="mt-1" type="error" variant="tonal">
              {{ row.errorMsg }}
            </VAlert>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="closeDialog">{{ $t('page.operlog.detail.close') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.detail-code {
  max-height: 180px;
  margin: 0;
  overflow: auto;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
