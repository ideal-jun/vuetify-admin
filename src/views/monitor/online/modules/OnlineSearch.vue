<script setup lang="ts">
import { ref, toRaw } from 'vue';

import { $t } from '@/locales';
import { jsonClone } from '@/utils/common';

defineOptions({ name: 'OnlineSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.MonitorOnline.SearchModel>('model', { required: true });

const expanded = ref<string[]>(['search']);

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
  <VDefaultsProvider
    :defaults="{
      VTextField: {
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
                <VCol cols="12" lg="3" md="4" sm="6">
                  <VTextField
                    v-model="model.userName"
                    clearable
                    :label="$t('page.online.search.userName')"
                    :placeholder="$t('page.online.search.userNamePlaceholder')"
                    prepend-inner-icon="mdi-account-outline"
                  />
                </VCol>

                <VCol cols="12" lg="3" md="4" sm="6">
                  <VTextField
                    v-model="model.ipaddr"
                    clearable
                    :label="$t('page.online.search.ipaddr')"
                    :placeholder="$t('page.online.search.ipaddrPlaceholder')"
                    prepend-inner-icon="mdi-ip-network-outline"
                  />
                </VCol>

                <VCol
                  class="filter-actions flex flex-wrap items-end justify-end gap-2"
                  cols="12"
                  lg="6"
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
