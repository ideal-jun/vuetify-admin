import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useTabStore } from '@/store/modules/tab';

import { useTabMenu } from './use-tab-menu';

const HOME_TAB: App.Global.Tab = {
  id: '/home',
  label: 'Home',
  routeKey: 'home',
  routePath: '/home',
  fullPath: '/home',
};

function createRoute(name: string, path: string): App.Global.TabRoute {
  return {
    name,
    path,
    fullPath: path,
    query: {},
    meta: {
      title: name,
      i18nKey: `route.${name}` as App.I18n.I18nKey,
      icon: 'mdi-file-outline',
    },
  };
}

describe('useTabMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setup() {
    const tabStore = useTabStore();

    tabStore.homeTab = HOME_TAB;

    return { tabStore, tabMenu: useTabMenu() };
  }

  it('hides the pin action and disables close actions for the home tab', () => {
    const { tabMenu } = setup();

    const options = tabMenu.getMenuOptions(HOME_TAB.id);

    expect(options.some((option) => option.key === 'pin' || option.key === 'unpin')).toBe(false);
    expect(options.find((option) => option.key === 'closeCurrent')?.disabled).toBe(true);
    expect(options.find((option) => option.key === 'closeLeft')?.disabled).toBe(true);
    expect(options.find((option) => option.key === 'closeOther')?.disabled).toBe(false);
  });

  it('turns pin into unpin and disables closing a pinned tab', async () => {
    const { tabStore, tabMenu } = setup();

    tabStore.addTab(createRoute('system_user', '/system/user'));

    expect(tabMenu.getMenuOptions('/system/user').some((option) => option.key === 'pin')).toBe(
      true,
    );

    await tabMenu.runTabAction('pin', '/system/user');

    const options = tabMenu.getMenuOptions('/system/user');

    expect(options.some((option) => option.key === 'unpin')).toBe(true);
    expect(options.find((option) => option.key === 'closeCurrent')?.disabled).toBe(true);
    expect(tabStore.isTabRetain('/system/user')).toBe(true);
  });

  it('closes the active tabs through the shared actions', async () => {
    const { tabStore, tabMenu } = setup();

    tabStore.addTab(createRoute('system_user', '/system/user'));
    tabStore.addTab(createRoute('system_role', '/system/role'), false);

    await tabMenu.runTabAction('closeCurrent', '/system/role');

    expect(tabStore.tabs.map((tab) => tab.id)).not.toContain('/system/role');

    // Keep the home tab active so clearing the other tabs does not trigger a router navigation
    tabStore.activeTabId = HOME_TAB.id;

    await tabMenu.runTabAction('closeAll', '/system/user');

    expect(tabStore.tabs.map((tab) => tab.id)).toEqual([HOME_TAB.id]);
  });
});
