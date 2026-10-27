<script setup lang="ts">
import { toRaw } from 'vue';

import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'GenSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.ToolGen.GenTableSearchModel>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

function handleReset() {
  resetModel();
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <SearchPanel @reset="handleReset" @search="handleSearch">
    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.tableName"
        clearable
        :label="$t('page.gen.search.tableName')"
        :placeholder="$t('page.gen.search.tableNamePlaceholder')"
        prepend-inner-icon="mdi-table"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.tableComment"
        clearable
        :label="$t('page.gen.search.tableComment')"
        :placeholder="$t('page.gen.search.tableCommentPlaceholder')"
        prepend-inner-icon="mdi-text-box-outline"
      />
    </VCol>
  </SearchPanel>
</template>
