<script setup lang="ts">
import { computed, toRaw } from 'vue';

import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { jsonClone, translateOptions } from '@/utils/common';

defineOptions({ name: 'RoleSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.RoleSearchModel>('model', { required: true });

const statusOptions = computed(() => translateOptions(enableStatusOptions));

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
        v-model="model.roleName"
        clearable
        :label="$t('page.system.role.columns.roleName')"
        :placeholder="$t('page.system.role.form.roleName')"
        prepend-inner-icon="mdi-shield-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.roleKey"
        clearable
        :label="$t('page.system.role.columns.roleKey')"
        :placeholder="$t('page.system.role.form.roleKey')"
        prepend-inner-icon="mdi-identifier"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.system.role.columns.status')"
        :placeholder="$t('page.system.role.form.status')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>
  </SearchPanel>
</template>
