<script setup lang="ts">
import { computed } from 'vue';

import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'DictDataSearch' });

defineProps<{
  /** Whether the dictionary type is selected */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemDict.DictDataSearchModel>('model', { required: true });

const statusOptions = computed(() => translateOptions(enableStatusOptions));

function handleReset() {
  model.value.dictLabel = null;
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
      v-model="model.dictLabel"
      class="min-w-0 flex-1"
      clearable
      density="compact"
      :disabled="disabled"
      :label="$t('page.dict.data.columns.dictLabel')"
      :placeholder="$t('page.dict.data.search.dictLabel')"
      prepend-inner-icon="mdi-tag-outline"
    />

    <VSelect
      v-model="model.status"
      class="min-w-0 flex-1"
      clearable
      density="compact"
      :disabled="disabled"
      item-title="label"
      item-value="value"
      :items="statusOptions"
      :label="$t('page.dict.data.columns.status')"
      :placeholder="$t('page.dict.data.search.status')"
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
