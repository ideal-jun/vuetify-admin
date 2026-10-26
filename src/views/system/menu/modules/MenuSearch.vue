<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';

import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { jsonClone, translateOptions } from '@/utils/common';

defineOptions({ name: 'MenuSearch' });

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.Menu.SearchModel>('model', { required: true });

const expanded = ref<string[]>(['search']);

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
      <VExpansionPanels v-model="expanded" :hover="false" multiple :ripple="false">
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
                    v-model="model.menuName"
                    clearable
                    :label="$t('page.system.menu.columns.menuName')"
                    :placeholder="$t('page.system.menu.search.menuName')"
                    prepend-inner-icon="mdi-menu"
                  />
                </VCol>

                <VCol cols="12" lg="3" md="4" sm="6">
                  <VSelect
                    v-model="model.status"
                    clearable
                    item-title="label"
                    item-value="value"
                    :items="statusOptions"
                    :label="$t('page.system.menu.columns.status')"
                    :placeholder="$t('page.system.menu.search.status')"
                    prepend-inner-icon="mdi-toggle-switch-outline"
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
