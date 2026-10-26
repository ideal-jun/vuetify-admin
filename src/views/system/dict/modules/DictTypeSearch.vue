<script setup lang="ts">
import { computed } from 'vue';

import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'DictTypeSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemDict.DictTypeSearchModel>('model', { required: true });

const statusOptions = computed(() => translateOptions(enableStatusOptions));

function handleReset() {
  model.value.dictName = null;
  model.value.dictType = null;
  model.value.status = null;
  emit('search');
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <VForm class="px-4 py-3" @submit.prevent="handleSearch">
    <VRow density="compact">
      <VCol cols="12" lg="2" md="4" sm="6">
        <VTextField
          v-model="model.dictName"
          clearable
          density="compact"
          :label="$t('page.dict.type.columns.dictName')"
          :placeholder="$t('page.dict.type.search.dictName')"
          prepend-inner-icon="mdi-book-open-variant"
        />
      </VCol>

      <VCol cols="12" lg="2" md="4" sm="6">
        <VTextField
          v-model="model.dictType"
          clearable
          density="compact"
          :label="$t('page.dict.type.columns.dictType')"
          :placeholder="$t('page.dict.type.search.dictType')"
          prepend-inner-icon="mdi-identifier"
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
          :label="$t('page.dict.type.columns.status')"
          :placeholder="$t('page.dict.type.search.status')"
          prepend-inner-icon="mdi-toggle-switch-outline"
        />
      </VCol>

      <VCol class="filter-actions flex items-center justify-end gap-2" cols="12">
        <VBtn prepend-icon="mdi-refresh" size="small" variant="text" @click="handleReset">
          {{ $t('common.reset') }}
        </VBtn>
        <VBtn color="primary" prepend-icon="mdi-magnify" size="small" type="submit">
          {{ $t('common.search') }}
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
