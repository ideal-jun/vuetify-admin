<script setup lang="ts">
import { computed, toRaw } from 'vue';

import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { jsonClone, translateOptions } from '@/utils/common';

defineOptions({ name: 'DeptSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.DeptSearchModel>('model', { required: true });

const statusOptions = computed(() => translateOptions(enableStatusOptions));

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
        v-model="model.deptName"
        clearable
        :label="$t('page.dept.columns.deptName')"
        :placeholder="$t('page.dept.form.deptName')"
        prepend-inner-icon="mdi-office-building-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.dept.columns.status')"
        :placeholder="$t('page.dept.form.status')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>
  </SearchPanel>
</template>
