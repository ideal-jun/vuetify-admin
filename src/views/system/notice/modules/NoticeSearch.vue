<script setup lang="ts">
import { computed, toRaw } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import SearchPanel from '@/components/advanced/SearchPanel.vue';
import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'NoticeSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.NoticeSearchModel>('model', { required: true });

const noticeTypeOptions = computed<CommonType.Option<Api.SystemManage.NoticeType>[]>(() => [
  { label: $t('page.notice.type.notice'), value: '1' },
  { label: $t('page.notice.type.announcement'), value: '2' },
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
        v-model="model.noticeTitle"
        clearable
        :label="$t('page.notice.columns.noticeTitle')"
        :placeholder="$t('page.notice.search.noticeTitle')"
        prepend-inner-icon="mdi-bullhorn-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VTextField
        v-model="model.createBy"
        clearable
        :label="$t('page.notice.columns.createBy')"
        :placeholder="$t('page.notice.search.createBy')"
        prepend-inner-icon="mdi-account-outline"
      />
    </VCol>

    <VCol cols="12" lg="2" md="4" sm="6">
      <VSelect
        v-model="model.noticeType"
        clearable
        item-title="label"
        item-value="value"
        :items="noticeTypeOptions"
        :label="$t('page.notice.columns.noticeType')"
        :placeholder="$t('page.notice.search.noticeType')"
        prepend-inner-icon="mdi-tag-outline"
      />
    </VCol>

    <VCol cols="12" lg="4" md="8" sm="12">
      <DateRangeField v-model:begin="model.beginTime" v-model:end="model.endTime" />
    </VCol>
  </SearchPanel>
</template>
