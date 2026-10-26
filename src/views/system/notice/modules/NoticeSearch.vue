<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';

import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'NoticeSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.NoticeSearchModel>('model', { required: true });

const expanded = ref<string[]>(['search']);

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
  <VDefaultsProvider
    :defaults="{
      VTextField: {
        density: 'compact',
        color: 'primary',
      },
      VSelect: {
        density: 'compact',
        color: 'primary',
      },
    }"
  >
    <VCard class="app-panel shrink-0" variant="flat">
      <VExpansionPanels v-model="expanded" :hover="false" :ripple="false" static>
        <VExpansionPanel :ripple="false" value="search">
          <VExpansionPanelTitle class="text-sm font-600">
            <div class="flex items-center gap-2">
              <VIcon icon="mdi-filter-variant" size="18" />
              {{ $t('common.search') }}
            </div>
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <VForm @submit.prevent="handleSearch">
              <VRow density="compact">
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

                <VCol cols="12" lg="2" md="4" sm="6">
                  <VTextField
                    v-model="model.beginTime"
                    clearable
                    :label="$t('page.notice.search.beginTime')"
                    prepend-inner-icon="mdi-calendar-start"
                    type="date"
                  />
                </VCol>

                <VCol cols="12" lg="2" md="4" sm="6">
                  <VTextField
                    v-model="model.endTime"
                    clearable
                    :label="$t('page.notice.search.endTime')"
                    prepend-inner-icon="mdi-calendar-end"
                    type="date"
                  />
                </VCol>

                <VCol class="flex flex-wrap items-end justify-end gap-2" cols="12" lg="2">
                  <VBtn prepend-icon="mdi-refresh" variant="text" @click="handleReset">
                    {{ $t('common.reset') }}
                  </VBtn>
                  <VBtn color="primary" prepend-icon="mdi-magnify" type="submit">
                    {{ $t('common.search') }}
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCard>
  </VDefaultsProvider>
</template>
