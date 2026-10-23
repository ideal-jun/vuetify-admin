<script setup lang="ts">
import FullScreen from '@/components/common/FullScreen.vue';
import LangSwitch from '@/components/common/LangSwitch.vue';
import MenuToggler from '@/components/common/MenuToggler.vue';
import ThemeSchemaSwitch from '@/components/common/ThemeSchemaSwitch.vue';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

import GlobalBreadcrumb from '../global-breadcrumb/index.vue';
import GlobalLogo from '../global-logo/index.vue';
import GlobalMenuHorizontal from '../global-menu/components/GlobalMenuHorizontal.vue';
import GlobalSearch from '../global-search/index.vue';
import ThemeButton from './components/ThemeButton.vue';
import UserAvatar from './components/UserAvatar.vue';

defineOptions({ name: 'GlobalHeader' });

const props = withDefaults(
  defineProps<{
    /** Whether to show the logo */
    showLogo?: boolean;
    /** Whether to show the sider toggler */
    showMenuToggler?: boolean;
    /** The menus rendered in the header */
    menus?: App.Global.Menu[];
  }>(),
  {
    showLogo: false,
    showMenuToggler: false,
    menus: () => [],
  },
);

const appStore = useAppStore();
const themeStore = useThemeStore();
</script>

<template>
  <div class="h-full w-full flex items-center gap-1 px-3">
    <GlobalLogo v-if="showLogo" class="shrink-0 !px-2" :show-title="!appStore.isMobile" />

    <MenuToggler
      v-if="showMenuToggler && !appStore.isMobile"
      :collapsed="appStore.siderCollapse"
      @click="appStore.toggleSiderCollapse"
    />

    <MenuToggler
      v-if="showMenuToggler && appStore.isMobile"
      :collapsed="!appStore.siderCollapse"
      @click="appStore.toggleSiderCollapse"
    />

    <div v-if="props.menus.length > 0" class="flex-1-hidden pl-2">
      <GlobalMenuHorizontal :items="props.menus" />
    </div>

    <div v-else class="flex-1-hidden">
      <GlobalBreadcrumb v-if="!appStore.isMobile" />
    </div>

    <GlobalSearch v-if="themeStore.header.globalSearch.visible" />

    <FullScreen v-if="!appStore.isMobile" />

    <LangSwitch
      v-if="themeStore.header.multilingual.visible"
      :lang="appStore.locale"
      :lang-options="appStore.localeOptions"
      @change-lang="appStore.changeLocale"
    />

    <ThemeSchemaSwitch
      :theme-schema="themeStore.themeScheme"
      @switch="themeStore.toggleThemeScheme"
    />

    <ThemeButton />

    <UserAvatar />
  </div>
</template>
