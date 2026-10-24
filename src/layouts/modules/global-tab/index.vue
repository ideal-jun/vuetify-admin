<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import PageTab from '@/components/advanced/page-tab/index.vue';
import ReloadButton from '@/components/common/ReloadButton.vue';
import ButtonIcon from '@/components/custom/ButtonIcon.vue';
import SvgIcon from '@/components/custom/SvgIcon.vue';
import { GLOBAL_TAB_WHEEL_SPEED_RATIO } from '@/constants/app';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTabStore } from '@/store/modules/tab';
import { useThemeStore } from '@/store/modules/theme';

import TabContextMenu from './ContextMenu.vue';
import { useTabMenu } from './use-tab-menu';

defineOptions({ name: 'GlobalTab' });

const route = useRoute();
const tabStore = useTabStore();
const themeStore = useThemeStore();
const appStore = useAppStore();
const { getMenuOptions, runTabAction } = useTabMenu();

const tabScrollRef = ref<HTMLElement>();

onMounted(async () => {
  tabStore.initTabStore(route);

  await scrollToActiveTab();
});

watch(
  () => route.fullPath,
  () => {
    tabStore.addTab(route);
  },
);

watch(
  () => tabStore.activeTabId,
  () => {
    void scrollToActiveTab();
  },
);

const activeId = computed(() => tabStore.activeTabId || tabStore.getTabIdByRoute(route));

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tabId: '',
});

const dropdownOptions = computed(() => getMenuOptions(activeId.value));

/** Scroll the active tab into view after the tab list changes */
async function scrollToActiveTab() {
  await nextTick();

  const container = tabScrollRef.value;
  const tabId = tabStore.activeTabId;

  if (!container || !tabId) {
    return;
  }

  const tabElement = Array.from(container.querySelectorAll<HTMLElement>('[data-tab-id]')).find(
    (element) => element.dataset.tabId === tabId,
  );

  if (!tabElement) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const tabRect = tabElement.getBoundingClientRect();

  if (tabRect.left < containerRect.left) {
    container.scrollLeft = Math.max(
      0,
      container.scrollLeft + tabRect.left - containerRect.left - 12,
    );
  } else if (tabRect.right > containerRect.right) {
    container.scrollLeft += tabRect.right - containerRect.right + 12;
  }
}

/** Convert the vertical wheel delta into horizontal tab scrolling */
function handleWheel(event: WheelEvent) {
  const container = tabScrollRef.value;

  if (!container || container.scrollWidth <= container.clientWidth) {
    return;
  }

  // Keep the native horizontal wheel/trackpad gesture untouched
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    return;
  }

  event.preventDefault();

  container.scrollLeft += event.deltaY * GLOBAL_TAB_WHEEL_SPEED_RATIO;
}

function isFixedTab(tab: App.Global.Tab) {
  return tab.fixedIndex !== undefined && tab.fixedIndex !== null;
}

function openContextMenu(event: MouseEvent, tabId: string) {
  event.preventDefault();

  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tabId,
  };
}

function handleMousedown(event: MouseEvent, tab: App.Global.Tab) {
  if (event.button !== 1 || !themeStore.tab.closeTabByMiddleClick) {
    return;
  }

  if (tabStore.isTabRetain(tab.id)) {
    return;
  }

  event.preventDefault();
  void tabStore.removeTab(tab.id);
}

function closeTab(tabId: string) {
  void tabStore.removeTab(tabId);
}

async function handleAction(key: App.Global.DropdownKey, tabId: string) {
  contextMenu.value.visible = false;

  await runTabAction(key, tabId);
}
</script>

<template>
  <div
    class="h-full w-full flex items-center px-4"
    :class="`app-tab-bar app-tab-bar--${themeStore.tab.mode}`"
  >
    <div
      ref="tabScrollRef"
      class="app-tab-scroll h-full flex flex-1 overflow-x-auto"
      :class="[
        `app-tab-scroll--${themeStore.tab.mode}`,
        themeStore.tab.mode === 'button' ? 'items-center gap-3' : 'items-end',
      ]"
      @wheel="handleWheel"
    >
      <PageTab
        v-for="tab in tabStore.tabs"
        :key="tab.id"
        :active="tab.id === activeId"
        :active-color="themeStore.themeColor"
        class="app-tab"
        :closable="!tabStore.isTabRetain(tab.id)"
        :dark-mode="themeStore.darkMode"
        :data-tab-id="tab.id"
        :mode="themeStore.tab.mode"
        :pinned="isFixedTab(tab)"
        @click="tabStore.switchRouteByTab(tab)"
        @close="closeTab(tab.id)"
        @contextmenu="openContextMenu($event, tab.id)"
        @mousedown="handleMousedown($event, tab)"
      >
        <template v-if="tab.icon" #prefix>
          <VIcon :icon="tab.icon" size="16" />
        </template>
        {{ tab.label }}
      </PageTab>
    </div>

    <div class="ml-3 flex items-center gap-1">
      <ReloadButton :loading="!appStore.reloadFlag" @click="appStore.reloadPage()" />

      <ButtonIcon
        :tooltip-content="
          $t(appStore.fullContent ? 'icon.contentFullscreenExit' : 'icon.contentFullscreen')
        "
        @click="appStore.toggleFullContent"
      >
        <SvgIcon :icon="appStore.fullContent ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" />
      </ButtonIcon>

      <VMenu location="bottom end">
        <template #activator="{ props: activatorProps }">
          <ButtonIcon v-bind="activatorProps" :tooltip-content="$t('common.operate')">
            <SvgIcon icon="mdi-dots-horizontal" />
          </ButtonIcon>
        </template>

        <VList density="compact" min-width="180">
          <VListItem
            v-for="action in dropdownOptions"
            :key="action.key"
            :disabled="action.disabled"
            :prepend-icon="action.icon"
            :title="action.label"
            @click="handleAction(action.key, activeId)"
          />
        </VList>
      </VMenu>
    </div>

    <TabContextMenu
      v-model:visible="contextMenu.visible"
      :tab-id="contextMenu.tabId"
      :x="contextMenu.x"
      :y="contextMenu.y"
    />
  </div>
</template>

<style scoped>
.app-tab-scroll {
  scrollbar-width: none;
}

.app-tab-scroll::-webkit-scrollbar {
  display: none;
}

/* The chrome tabs overlap by 18px, keep the last one fully visible while scrolling */
.app-tab-scroll--chrome {
  padding-right: 18px;
}
</style>
