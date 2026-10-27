<script setup lang="ts">
import { computed, toRaw } from 'vue';

import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { jsonClone, translateOptions } from '@/utils/common';

defineOptions({ name: 'PostSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.PostSearchModel>('model', { required: true });

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
        v-model="model.postCode"
        clearable
        :label="$t('page.post.columns.postCode')"
        :placeholder="$t('page.post.form.postCode')"
        prepend-inner-icon="mdi-identifier"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.postName"
        clearable
        :label="$t('page.post.columns.postName')"
        :placeholder="$t('page.post.form.postName')"
        prepend-inner-icon="mdi-badge-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.status"
        clearable
        item-title="label"
        item-value="value"
        :items="statusOptions"
        :label="$t('page.post.columns.status')"
        :placeholder="$t('page.post.form.status')"
        prepend-inner-icon="mdi-toggle-switch-outline"
      />
    </VCol>
  </SearchPanel>
</template>
