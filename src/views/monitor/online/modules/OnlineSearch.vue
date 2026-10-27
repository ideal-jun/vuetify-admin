<script setup lang="ts">
import { toRaw } from 'vue';

import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'OnlineSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.MonitorOnline.SearchModel>('model', { required: true });

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
        :label="$t('page.online.search.userName')"
        :placeholder="$t('page.online.search.userNamePlaceholder')"
        prepend-inner-icon="mdi-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.ipaddr"
        clearable
        :label="$t('page.online.search.ipaddr')"
        :placeholder="$t('page.online.search.ipaddrPlaceholder')"
        prepend-inner-icon="mdi-ip-network-outline"
      />
    </VCol>
  </SearchPanel>
</template>
