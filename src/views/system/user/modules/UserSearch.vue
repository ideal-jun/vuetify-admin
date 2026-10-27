<script setup lang="ts">
import { computed, toRaw } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { jsonClone, translateOptions } from '@/utils/common';

defineOptions({ name: 'UserSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.UserSearchModel>('model', { required: true });

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
        v-model="model.userName"
        clearable
        :label="$t('page.system.user.columns.userName')"
        :placeholder="$t('page.system.user.form.userName')"
        prepend-inner-icon="mdi-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.phonenumber"
        clearable
        :label="$t('page.system.user.columns.phonenumber')"
        :placeholder="$t('page.system.user.form.phonenumber')"
        prepend-inner-icon="mdi-cellphone"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.system.user.columns.status')"
        :placeholder="$t('page.system.user.form.status')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>

    <VCol cols="12" lg="4" md="8" sm="12">
      <DateRangeField v-model:begin="model.beginTime" v-model:end="model.endTime" />
    </VCol>
  </SearchPanel>
</template>
