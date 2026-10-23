<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import GlobalFeedback from '@/components/common/GlobalFeedback.vue';
import Watermark from '@/components/common/Watermark.vue';
import { useAppStore } from '@/store/modules/app';
import { useRouteStore } from '@/store/modules/route';
import { useThemeStore } from '@/store/modules/theme';

import GlobalContent from '../modules/global-content/index.vue';
import GlobalFooter from '../modules/global-footer/index.vue';
import GlobalHeader from '../modules/global-header/index.vue';
import GlobalMenu from '../modules/global-menu/index.vue';
import GlobalSider from '../modules/global-sider/index.vue';
import GlobalTab from '../modules/global-tab/index.vue';
import ThemeDrawer from '../modules/theme-drawer/index.vue';
import { getLayoutMenuConfig } from './shared';

defineOptions({ name: 'BaseLayout' });

const route = useRoute();
const appStore = useAppStore();
const routeStore = useRouteStore();
const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);

const isHorizontal = computed(() => layoutMode.value === 'horizontal');
const isTopHybrid = computed(
  () =>
    layoutMode.value === 'top-hybrid-sidebar-first' ||
    layoutMode.value === 'top-hybrid-header-first',
);

const layoutConfig = computed(() =>
  getLayoutMenuConfig(
    layoutMode.value,
    routeStore.menus,
    String(route.name ?? ''),
    route.meta.activeMenu,
  ),
);

const siderRail = computed(() => appStore.siderCollapse);

const siderWidth = computed(() =>
  isTopHybrid.value ? themeStore.sider.mixChildMenuWidth : themeStore.sider.width,
);

const siderRailWidth = computed(() =>
  isTopHybrid.value ? themeStore.sider.mixCollapsedWidth : themeStore.sider.collapsedWidth,
);

const mixRailWidth = computed(() =>
  appStore.siderCollapse ? themeStore.sider.mixCollapsedWidth : themeStore.sider.mixWidth,
);

const tabVisible = computed(() => themeStore.tab.visible);

// The fullscreen exit button lives in the tab bar, so restore the normal layout when the tab bar is hidden
watch(tabVisible, (visible) => {
  if (!visible && appStore.fullContent) {
    appStore.toggleFullContent();
  }
});
</script>

<template>
  <VApp>
    <GlobalSider
      v-if="layoutConfig.showSider && !layoutConfig.isVerticalMix && !appStore.fullContent"
      :rail="siderRail"
      :rail-width="siderRailWidth"
      :show-logo="layoutConfig.showSiderLogo"
      :width="siderWidth"
    >
      <GlobalMenu
        :compact="layoutConfig.isTopHybridHeaderFirst"
        :items="layoutConfig.siderMenus"
        :max-depth="layoutConfig.siderMaxDepth"
        :rail="siderRail"
      />
    </GlobalSider>

    <GlobalSider
      v-if="layoutConfig.isVerticalMix && !appStore.fullContent"
      :rail="siderRail"
      :rail-width="themeStore.sider.mixCollapsedWidth"
      :width="themeStore.sider.mixWidth + themeStore.sider.mixChildMenuWidth"
    >
      <div class="mix-sider">
        <div class="mix-sider__rail" :style="{ width: `${mixRailWidth}px` }">
          <GlobalMenu :items="layoutConfig.railMenus" rail />
        </div>

        <div
          v-if="!appStore.siderCollapse"
          class="mix-sider__panel"
          :style="{ width: `${themeStore.sider.mixChildMenuWidth}px` }"
        >
          <GlobalMenu :items="layoutConfig.siderMenus" />
        </div>
      </div>
    </GlobalSider>

    <VAppBar
      :extension-height="tabVisible ? themeStore.tab.height : 0"
      :flat="appStore.fullContent"
      :height="appStore.fullContent ? 0 : themeStore.header.height"
    >
      <GlobalHeader
        v-if="!appStore.fullContent"
        :menus="layoutConfig.headerMenus"
        :show-logo="isHorizontal || isTopHybrid"
        :show-menu-toggler="!isHorizontal && layoutConfig.showSider"
      />
      <template v-if="tabVisible" #extension>
        <GlobalTab />
      </template>
    </VAppBar>

    <VMain :scrollable="themeStore.layout.scrollMode === 'content'">
      <GlobalContent />
    </VMain>

    <VFooter
      v-if="themeStore.footer.visible && !appStore.fullContent"
      app
      :height="themeStore.footer.height"
    >
      <GlobalFooter :right="isTopHybrid && themeStore.footer.right" />
    </VFooter>

    <ThemeDrawer />
    <GlobalFeedback />
    <Watermark v-if="themeStore.watermark.visible" :content="themeStore.watermarkContent" />
  </VApp>
</template>

<style scoped>
.mix-sider {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.mix-sider__rail {
  flex: none;
  height: 100%;
  overflow: hidden;
}

.mix-sider__panel {
  flex: none;
  height: 100%;
  overflow-y: auto;
  border-inline-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
