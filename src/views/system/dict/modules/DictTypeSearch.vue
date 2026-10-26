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
  <VForm class="flex flex-wrap items-center gap-2 px-4 py-3" @submit.prevent="handleSearch">
    <VTextField
      v-model="model.dictName"
      class="min-w-0 flex-1"
      clearable
      density="compact"
      :label="$t('page.dict.type.columns.dictName')"
      :placeholder="$t('page.dict.type.search.dictName')"
      prepend-inner-icon="mdi-book-open-variant"
    />

    <VTextField
      v-model="model.dictType"
      class="min-w-0 flex-1"
      clearable
      density="compact"
      :label="$t('page.dict.type.columns.dictType')"
      :placeholder="$t('page.dict.type.search.dictType')"
      prepend-inner-icon="mdi-identifier"
    />

    <VSelect
      v-model="model.status"
      class="min-w-0 flex-1"
      clearable
      density="compact"
      item-title="label"
      item-value="value"
      :items="statusOptions"
      :label="$t('page.dict.type.columns.status')"
      :placeholder="$t('page.dict.type.search.status')"
      prepend-inner-icon="mdi-toggle-switch-outline"
    />

    <div class="flex shrink-0 items-center gap-2">
      <VBtn prepend-icon="mdi-refresh" size="small" variant="text" @click="handleReset">
        {{ $t('common.reset') }}
      </VBtn>
      <VBtn color="primary" prepend-icon="mdi-magnify" size="small" type="submit">
        {{ $t('common.search') }}
      </VBtn>
    </div>
  </VForm>
</template>
