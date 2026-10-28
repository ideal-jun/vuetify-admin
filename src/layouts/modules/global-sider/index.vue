<script setup lang="ts">
import { computed, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

import GlobalLogo from '../global-logo/index.vue';

defineOptions({ name: 'GlobalSider' });

const {
  width,
  railWidth = 76,
  rail = false,
  order = 0,
  showLogo = true,
} = defineProps<{
  /** The expanded width of the drawer */
  width: number;
  /** The width of the native rail */
  railWidth?: number;
  /** Whether the drawer is rendered as a Vuetify rail */
  rail?: boolean;
  /** The layout order, the mix layout uses it to place the second drawer */
  order?: number;
  /** Whether to show the logo */
  showLogo?: boolean;
}>();

const appStore = useAppStore();
const themeStore = useThemeStore();
const { mobile } = useDisplay();

const isMobile = computed(() => mobile.value || appStore.isMobile);

const isRail = computed(() => rail && !isMobile.value);

const open = computed({
  get: () => (isMobile.value ? !appStore.siderCollapse : true),
  set: (value) => {
    if (isMobile.value) {
      appStore.setSiderCollapse(!value);
    }
  },
});

watch(isMobile, (value, oldValue) => {
  if (oldValue && !value) {
    appStore.setSiderCollapse(false);
  }
});
</script>

<template>
  <VNavigationDrawer
    v-model="open"
    expand-on-hover
    :order="order"
    :permanent="!isMobile"
    :rail="isRail"
    :rail-width="railWidth"
    :temporary="isMobile"
    :theme="themeStore.sider.inverted ? 'dark' : undefined"
    :width="width"
  >
    <template v-if="showLogo" #prepend>
      <GlobalLogo class="w-full" :show-title="!isRail" />
      <VDivider />
    </template>

    <slot />
  </VNavigationDrawer>
</template>
