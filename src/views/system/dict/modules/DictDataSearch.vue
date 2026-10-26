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
  <VForm class="px-4 py-3" @submit.prevent="handleSearch">
    <VRow density="compact">
      <VCol cols="12" sm="5">
        <VTextField
          v-model="model.dictLabel"
          clearable
          density="compact"
          :disabled="disabled"
          :label="$t('page.dict.data.columns.dictLabel')"
          :placeholder="$t('page.dict.data.search.dictLabel')"
          prepend-inner-icon="mdi-tag-outline"
        />
      </VCol>

      <VCol cols="12" sm="4">
        <VSelect
          v-model="model.status"
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
      </VCol>

      <VCol class="flex items-center justify-end gap-2" cols="12" sm="3">
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
