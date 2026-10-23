import { $t } from '@/locales';
import { useTabStore } from '@/store/modules/tab';

export interface TabMenuOption {
  key: App.Global.DropdownKey;
  label: string;
  icon: string;
  disabled: boolean;
}

const TAB_MENU_ICONS: Record<App.Global.DropdownKey, string> = {
  closeCurrent: 'mdi-close',
  closeOther: 'mdi-close-box-multiple-outline',
  closeLeft: 'mdi-arrow-collapse-left',
  closeRight: 'mdi-arrow-collapse-right',
  closeAll: 'mdi-close-box-outline',
  pin: 'mdi-pin',
  unpin: 'mdi-pin-off',
};

/**
 * Build the tab dropdown options and run their actions.
 *
 * The options are shared by the tab context menu and the tab bar dropdown so both entry points keep the same
 * disabled/pin rules.
 */
export function useTabMenu() {
  const tabStore = useTabStore();

  function getMenuOptions(tabId: string): TabMenuOption[] {
    const isRetained = tabStore.isTabRetain(tabId);

    const options: TabMenuOption[] = [
      {
        key: 'closeCurrent',
        label: $t('dropdown.closeCurrent'),
        icon: TAB_MENU_ICONS.closeCurrent,
        disabled: isRetained,
      },
      {
        key: 'closeOther',
        label: $t('dropdown.closeOther'),
        icon: TAB_MENU_ICONS.closeOther,
        disabled: false,
      },
      {
        key: 'closeLeft',
        label: $t('dropdown.closeLeft'),
        icon: TAB_MENU_ICONS.closeLeft,
        disabled: isRetained,
      },
      {
        key: 'closeRight',
        label: $t('dropdown.closeRight'),
        icon: TAB_MENU_ICONS.closeRight,
        disabled: false,
      },
      {
        key: 'closeAll',
        label: $t('dropdown.closeAll'),
        icon: TAB_MENU_ICONS.closeAll,
        disabled: false,
      },
    ];

    // The home tab is never pinned, and it has no pin/unpin action
    if (tabId !== tabStore.homeTab?.id) {
      const key: App.Global.DropdownKey = isRetained ? 'unpin' : 'pin';

      options.push({
        key,
        label: $t(isRetained ? 'dropdown.unpin' : 'dropdown.pin'),
        icon: TAB_MENU_ICONS[key],
        disabled: false,
      });
    }

    return options;
  }

  async function runTabAction(key: App.Global.DropdownKey, tabId: string) {
    if (key === 'closeCurrent') {
      await tabStore.removeTab(tabId);

      return;
    }

    if (key === 'closeOther') {
      await tabStore.clearTabs([tabId]);

      return;
    }

    if (key === 'closeLeft') {
      await tabStore.clearLeftTabs(tabId);

      return;
    }

    if (key === 'closeRight') {
      await tabStore.clearRightTabs(tabId);

      return;
    }

    if (key === 'closeAll') {
      await tabStore.clearTabs();

      return;
    }

    if (key === 'pin') {
      tabStore.fixTab(tabId);

      return;
    }

    if (key === 'unpin') {
      tabStore.unfixTab(tabId);
    }
  }

  return {
    getMenuOptions,
    runTabAction,
  };
}
