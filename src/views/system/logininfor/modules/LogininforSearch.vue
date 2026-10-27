<script setup lang="ts">
import { computed } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import { $t } from '@/locales';
import { translateOptions } from '@/utils/common';

import { logininforStatusOptions } from './shared';

defineOptions({ name: 'LogininforSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemLogininfor.SearchModel>('model', { required: true });

const statusOptions = computed(() => translateOptions(logininforStatusOptions));

function handleReset() {
  model.value.userName = null;
  model.value.ipaddr = null;
  model.value.status = null;
  model.value.beginTime = null;
  model.value.endTime = null;
  emit('search');
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <VRow density="compact">
    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.userName"
        clearable
        density="compact"
        :label="$t('page.logininfor.columns.userName')"
        :placeholder="$t('page.logininfor.search.userName')"
        prepend-inner-icon="mdi-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.ipaddr"
        clearable
        density="compact"
        :label="$t('page.logininfor.columns.ipaddr')"
        :placeholder="$t('page.logininfor.search.ipaddr')"
        prepend-inner-icon="mdi-ip-network-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        density="compact"
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.logininfor.columns.status')"
        :placeholder="$t('page.logininfor.search.status')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>

    <VCol cols="12" lg="4" md="8" sm="12">
      <DateRangeField v-model:begin="model.beginTime" v-model:end="model.endTime" />
    </VCol>

    <VCol class="flex items-center justify-end gap-2" cols="12">
      <VBtn prepend-icon="mdi-refresh" size="small" variant="text" @click="handleReset">
        {{ $t('common.reset') }}
      </VBtn>
      <VBtn color="primary" prepend-icon="mdi-magnify" size="small" @click="handleSearch">
        {{ $t('common.search') }}
      </VBtn>
    </VCol>
  </VRow>
</template>
