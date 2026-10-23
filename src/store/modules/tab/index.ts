import { useEventListener } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SetupStoreId } from '@/enum';
import { useRouterPush } from '@/hooks/common/router';
import { router } from '@/router';
import type { RouteKey } from '@/router/route-key';
import { localStg } from '@/utils/storage';

import { useRouteStore } from '../route';
import { useThemeStore } from '../theme';
import {
  extractTabsByAllRoutes,
  filterTabsByIds,
  findTabByRouteName,
  getAllTabs,
  getDefaultHomeTab,
  getFixedTabIds,
  getTabByRoute,
  getTabIdByRoute,
  isTabInTabs,
  reorderFixedTabs,
  updateTabByI18nKey,
  updateTabsByI18nKey,
} from './shared';

export const useTabStore = defineStore(SetupStoreId.Tab, () => {
  const themeStore = useThemeStore();
  const { routerPush, routerPushByKey } = useRouterPush(false);

  /** Tabs */
  const tabs = ref<App.Global.Tab[]>([]);

  /** The home tab */
  const homeTab = ref<App.Global.Tab>();

  /** Init the home tab */
  function initHomeTab() {
    const routeStore = useRouteStore();

    homeTab.value = getDefaultHomeTab(router, routeStore.routeHome);
  }

  /** All tabs */
  const allTabs = computed(() => getAllTabs(tabs.value, homeTab.value));

  /** Active tab id */
  const activeTabId = ref<string>('');

  /** Set the active tab id */
  function setActiveTabId(id: string) {
    activeTabId.value = id;
  }

  /** Init the tab store */
  function initTabStore(currentRoute: App.Global.TabRoute) {
    const storageTabs = localStg.get('globalTabs');

    if (themeStore.tab.cache && storageTabs) {
      const extractedTabs = extractTabsByAllRoutes(router, storageTabs);

      tabs.value = updateTabsByI18nKey(extractedTabs);
    }

    addTab(currentRoute);
  }

  /**
   * Add a tab
   *
   * @param route The tab route
   * @param active Whether to activate the added tab
   */
  function addTab(route: App.Global.TabRoute, active = true) {
    const tab = getTabByRoute(route);

    const isHomeTab = tab.id === homeTab.value?.id;

    if (!isHomeTab && !isTabInTabs(tab.id, tabs.value)) {
      tabs.value.push(tab);
    }

    if (active) {
      setActiveTabId(tab.id);
    }
  }

  /** Remove a tab */
  async function removeTab(tabId: string) {
    const removeTabIndex = tabs.value.findIndex((tab) => tab.id === tabId);

    if (removeTabIndex === -1) {
      return;
    }

    const removedTab = tabs.value[removeTabIndex];

    if (!removedTab) {
      return;
    }

    const removedTabRouteKey = removedTab.routeKey;
    const isRemoveActiveTab = activeTabId.value === tabId;

    // If removing the last tab, switch to the previous one
    const nextTab =
      tabs.value[removeTabIndex + 1] || tabs.value[removeTabIndex - 1] || homeTab.value;

    tabs.value.splice(removeTabIndex, 1);

    if (isRemoveActiveTab && nextTab) {
      await switchRouteByTab(nextTab);
    }

    const routeStore = useRouteStore();

    await routeStore.resetRouteCache(removedTabRouteKey);
  }

  /** Remove the active tab */
  async function removeActiveTab() {
    await removeTab(activeTabId.value);
  }

  /** Remove a tab by route name */
  async function removeTabByRouteName(routeName: RouteKey) {
    const tab = findTabByRouteName(routeName, tabs.value);

    if (!tab) {
      return;
    }

    await removeTab(tab.id);
  }

  /** Clear tabs */
  async function clearTabs(excludes: string[] = []) {
    const remainTabIds = new Set([...getFixedTabIds(tabs.value), ...excludes]);

    const tabsToRemove = tabs.value.filter((tab) => !remainTabIds.has(tab.id));

    if (tabsToRemove.length === 0) {
      return;
    }

    const routeKeysToReset = tabsToRemove.map((tab) => tab.routeKey);
    const removedTabsIds = tabsToRemove.map((tab) => tab.id);
    const isRemoveActiveTab = removedTabsIds.includes(activeTabId.value);

    const updatedTabs = filterTabsByIds(removedTabsIds, tabs.value);

    if (isRemoveActiveTab) {
      const activeTabCandidate = updatedTabs.at(-1) || homeTab.value;

      if (activeTabCandidate) {
        await switchRouteByTab(activeTabCandidate);
      }

      tabs.value = updatedTabs;
    } else {
      tabs.value = updatedTabs;
    }

    const routeStore = useRouteStore();

    for (const routeKey of routeKeysToReset) {
      await routeStore.resetRouteCache(routeKey);
    }
  }

  /** Replace a tab */
  async function replaceTab(key: RouteKey, options?: App.Global.RouterPushOptions) {
    const oldTabId = activeTabId.value;

    await routerPushByKey(key, options);

    if (!isTabRetain(oldTabId)) {
      await removeTab(oldTabId);
    }
  }

  /** Switch the route by tab */
  async function switchRouteByTab(tab: App.Global.Tab) {
    const fail = await routerPush(tab.fullPath);

    if (!fail) {
      setActiveTabId(tab.id);
    }
  }

  /** Clear the left tabs */
  async function clearLeftTabs(tabId: string) {
    const tabIds = tabs.value.map((tab) => tab.id);
    const index = tabIds.indexOf(tabId);

    if (index === -1) {
      return;
    }

    await clearTabs(tabIds.slice(index));
  }

  /** Clear the right tabs */
  async function clearRightTabs(tabId: string) {
    const isHomeTab = tabId === homeTab.value?.id;

    if (isHomeTab) {
      await clearTabs();

      return;
    }

    const tabIds = tabs.value.map((tab) => tab.id);
    const index = tabIds.indexOf(tabId);

    if (index === -1) {
      return;
    }

    await clearTabs(tabIds.slice(0, index + 1));
  }

  /** Pin a tab */
  function fixTab(tabId: string) {
    const tabIndex = tabs.value.findIndex((t) => t.id === tabId);

    if (tabIndex === -1) {
      return;
    }

    const tab = tabs.value[tabIndex];

    if (!tab) {
      return;
    }

    const fixedCount = getFixedTabIds(tabs.value).length;

    tab.fixedIndex = fixedCount;

    if (tabIndex !== fixedCount) {
      tabs.value.splice(tabIndex, 1);
      tabs.value.splice(fixedCount, 0, tab);
    }

    reorderFixedTabs(tabs.value);
  }

  /** Unpin a tab */
  function unfixTab(tabId: string) {
    const tabIndex = tabs.value.findIndex((t) => t.id === tabId);

    if (tabIndex === -1) {
      return;
    }

    const tab = tabs.value[tabIndex];

    if (!tab) {
      return;
    }

    tab.fixedIndex = undefined;

    const fixedCount = getFixedTabIds(tabs.value).length;

    if (tabIndex !== fixedCount) {
      tabs.value.splice(tabIndex, 1);
      tabs.value.splice(fixedCount, 0, tab);
    }

    reorderFixedTabs(tabs.value);
  }

  /** Set the new label of a tab */
  function setTabLabel(label: string, tabId?: string) {
    const id = tabId || activeTabId.value;

    const tab = tabs.value.find((item) => item.id === id);

    if (!tab) {
      return;
    }

    tab.oldLabel = tab.label;
    tab.newLabel = label;
  }

  /** Reset the label of a tab */
  function resetTabLabel(tabId?: string) {
    const id = tabId || activeTabId.value;

    const tab = tabs.value.find((item) => item.id === id);

    if (!tab) {
      return;
    }

    tab.newLabel = undefined;
  }

  /** Whether the tab is retained */
  function isTabRetain(tabId: string) {
    if (tabId === homeTab.value?.id) {
      return true;
    }

    return getFixedTabIds(tabs.value).includes(tabId);
  }

  /** Update the tabs by locale */
  function updateTabsByLocale() {
    tabs.value = updateTabsByI18nKey(tabs.value);

    if (homeTab.value) {
      homeTab.value = updateTabByI18nKey(homeTab.value);
    }
  }

  /** Cache the tabs */
  function cacheTabs() {
    if (!themeStore.tab.cache) {
      return;
    }

    localStg.set('globalTabs', tabs.value);
  }

  // Cache the tabs when the page is closed or refreshed
  useEventListener(window, 'beforeunload', () => {
    cacheTabs();
  });

  return {
    tabs: allTabs,
    activeTabId,
    homeTab,
    initHomeTab,
    initTabStore,
    addTab,
    removeTab,
    removeActiveTab,
    removeTabByRouteName,
    replaceTab,
    clearTabs,
    clearLeftTabs,
    clearRightTabs,
    fixTab,
    unfixTab,
    switchRouteByTab,
    setTabLabel,
    resetTabLabel,
    isTabRetain,
    updateTabsByLocale,
    getTabIdByRoute,
    cacheTabs,
  };
});
