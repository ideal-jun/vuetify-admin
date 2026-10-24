<script setup lang="ts">
import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';

defineOptions({ name: 'ThemeButton' });

const appStore = useAppStore();
</script>

<template>
  <ButtonIcon :tooltip-content="$t('icon.themeConfig')" @click="appStore.openThemeDrawer">
    <SvgIcon icon="mdi-palette-outline" />
  </ButtonIcon>
</template>
