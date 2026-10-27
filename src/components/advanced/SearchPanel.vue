<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'SearchPanel' });

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

const expanded = ref<string[]>(['search']);
</script>

<template>
  <VDefaultsProvider
    :defaults="{
      VTextField: { density: 'compact', color: 'primary' },
      VSelect: { density: 'compact', color: 'primary' },
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
            <VForm @submit.prevent="emit('search')">
              <VRow density="compact">
                <slot />

                <VCol class="flex flex-wrap items-end justify-end gap-2" cols="12">
                  <VBtn prepend-icon="mdi-refresh" variant="text" @click="emit('reset')">
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
