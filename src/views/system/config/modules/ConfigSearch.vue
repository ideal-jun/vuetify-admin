<script setup lang="ts">
import { computed, toRaw } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'ConfigSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.ConfigSearchModel>('model', { required: true });

const configTypeOptions = computed<CommonType.Option<Api.SystemManage.ConfigType>[]>(() => [
  { label: $t('page.config.type.yes'), value: 'Y' },
  { label: $t('page.config.type.no'), value: 'N' },
]);

const defaultModel = jsonClone(toRaw(model.value));

function handleReset() {
  Object.assign(model.value, defaultModel);
}

function handleSearch() {
  emit('search');
}
</script>

<template>
  <SearchPanel @reset="handleReset" @search="handleSearch">
    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.configName"
        clearable
        :label="$t('page.config.columns.configName')"
        :placeholder="$t('page.config.search.configName')"
        prepend-inner-icon="mdi-cog-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.configKey"
        clearable
        :label="$t('page.config.columns.configKey')"
        :placeholder="$t('page.config.search.configKey')"
        prepend-inner-icon="mdi-identifier"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.configType"
        clearable
        item-title="label"
        item-value="value"
        :items="configTypeOptions"
        :label="$t('page.config.columns.configType')"
        :placeholder="$t('page.config.search.configType')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>

    <VCol cols="12" lg="4" md="8" sm="12">
      <DateRangeField v-model:begin="model.beginTime" v-model:end="model.endTime" />
    </VCol>
  </SearchPanel>
</template>
