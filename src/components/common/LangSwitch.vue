<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'LangSwitch' });

const props = withDefaults(
  defineProps<{
    /** Current language */
    lang: App.I18n.LangType;
    /** Language options */
    langOptions: App.I18n.LangOption[];
    /** Show tooltip */
    showTooltip?: boolean;
  }>(),
  {
    showTooltip: true,
  },
);

const emit = defineEmits<{
  (e: 'change-lang', lang: App.I18n.LangType): void;
}>();

const tooltipContent = computed(() => (props.showTooltip ? $t('icon.lang') : ''));

function changeLang(lang: App.I18n.LangType) {
  emit('change-lang', lang);
}
</script>

<template>
  <VMenu location="bottom end">
    <template #activator="{ props: activatorProps }">
      <span v-bind="activatorProps">
        <ButtonIcon :tooltip-content="tooltipContent">
          <SvgIcon icon="mdi-translate" />
        </ButtonIcon>
      </span>
    </template>

    <VList density="compact" min-width="140">
      <VListItem
        v-for="option in langOptions"
        :key="option.key"
        :active="option.key === lang"
        :title="option.label"
        @click="changeLang(option.key)"
      />
    </VList>
  </VMenu>
</template>
