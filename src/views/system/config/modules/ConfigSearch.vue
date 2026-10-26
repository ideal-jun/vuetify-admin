<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';

import DateRangeField from '@/components/advanced/DateRangeField.vue';
import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'ConfigSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.SystemManage.ConfigSearchModel>('model', { required: true });

const expanded = ref<string[]>(['search']);

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
              <VRow class="filter-row" density="compact">
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

                <VCol class="filter-date" cols="12" lg="4" md="8" sm="12">
                  <DateRangeField v-model:begin="model.beginTime" v-model:end="model.endTime" />
                </VCol>

                <VCol
                  class="filter-actions flex flex-wrap items-end justify-end gap-2"
                  cols="12"
                  lg="2"
                >
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
