<script setup lang="ts">
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
