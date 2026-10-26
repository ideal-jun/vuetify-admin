<script setup lang="ts">
import { useDisplay } from 'vuetify';

import { $t } from '@/locales';

import { getBusinessTypeLabel, operlogStatusRecord } from './shared';

defineOptions({ name: 'OperlogDetailDialog' });

const props = defineProps<{
  row: Api.SystemOperlog.Operlog | null;
}>();

const visible = defineModel<boolean>('visible', { required: true });

const { mobile } = useDisplay();

function closeDialog() {
  visible.value = false;
}
</script>

<template>
  <VDialog v-model="visible" :max-width="mobile ? '100%' : 960" scrollable>
    <VCard v-if="props.row">
      <VCardTitle class="text-base font-600">
        {{ $t('page.operlog.detail.title') }}
      </VCardTitle>

      <VDivider />

      <VCardText class="max-h-[70vh] overflow-y-auto">
        <VRow density="compact">
          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.module') }}</div>
            <div class="mt-1 text-sm">
              {{ props.row.title }} / {{ getBusinessTypeLabel(props.row.businessType) }}
            </div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.loginInfo') }}</div>
            <div class="mt-1 text-sm">
              {{ props.row.operName || '—' }} / {{ props.row.operIp || '—' }}
            </div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.deptName') }}</div>
            <div class="mt-1 text-sm">{{ props.row.deptName || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operLocation') }}</div>
            <div class="mt-1 text-sm">{{ props.row.operLocation || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operUrl') }}</div>
            <div class="mt-1 break-all text-sm">{{ props.row.operUrl || '—' }}</div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.requestMethod') }}</div>
            <div class="mt-1 text-sm">
              {{ props.row.requestMethod || '—' }} / {{ props.row.method || '—' }}
            </div>
          </VCol>

          <VCol cols="12" sm="6">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.status') }}</div>
            <div class="mt-1">
              <VChip
                :color="props.row.status === '0' ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ $t(operlogStatusRecord[props.row.status]) }}
              </VChip>
            </div>
          </VCol>

          <VCol cols="12" sm="3">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.costTime') }}</div>
            <div class="mt-1 text-sm">
              {{ $t('page.operlog.costTimeUnit', { value: props.row.costTime ?? 0 }) }}
            </div>
          </VCol>

          <VCol cols="12" sm="3">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operTime') }}</div>
            <div class="mt-1 text-sm">{{ props.row.operTime || '—' }}</div>
          </VCol>

          <VCol cols="12">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.operParam') }}</div>
            <pre class="detail-code mt-1">{{ props.row.operParam || '—' }}</pre>
          </VCol>

          <VCol cols="12">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.jsonResult') }}</div>
            <pre class="detail-code mt-1">{{ props.row.jsonResult || '—' }}</pre>
          </VCol>

          <VCol v-if="props.row.status === '1' && props.row.errorMsg" cols="12">
            <div class="text-xs opacity-50">{{ $t('page.operlog.detail.errorMsg') }}</div>
            <VAlert class="mt-1" type="error" variant="tonal">
              {{ props.row.errorMsg }}
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
