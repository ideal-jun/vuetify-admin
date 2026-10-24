import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SetupStoreId } from '@/enum';
import {
  fetchCreateMenu,
  fetchDeleteMenu,
  fetchGetMenuList,
  fetchUpdateMenu,
} from '@/service/api/system-manage';

export type MenuTableRow = Api.RuoYi.Menu & {
  depth: number;
};

/**
 * Build the tree-ordered flat list from the RuoYi menu list
 *
 * RuoYi returns the flat rows ordered by parentId (all roots first, then every child, then the buttons), which is not
 * suitable for a tree table. This walks every menu's children recursively, so each parent is immediately followed by
 * its descendants, with siblings sorted by orderNum.
 */
function flattenMenus(items: Api.RuoYi.Menu[]): MenuTableRow[] {
  const menuMap = new Map(items.map((item) => [item.menuId, item]));
  const childrenMap = new Map<number, Api.RuoYi.Menu[]>();

  for (const item of items) {
    const parentId = menuMap.has(item.parentId) ? item.parentId : 0;
    const children = childrenMap.get(parentId) ?? [];

    children.push(item);
    childrenMap.set(parentId, children);
  }

  for (const children of childrenMap.values()) {
    children.sort(
      (first, second) => first.orderNum - second.orderNum || first.menuId - second.menuId,
    );
  }

  const rows: MenuTableRow[] = [];
  const visited = new Set<number>();

  const walk = (parentId: number, depth: number) => {
    for (const item of childrenMap.get(parentId) ?? []) {
      if (visited.has(item.menuId)) {
        continue;
      }

      visited.add(item.menuId);
      rows.push({ ...item, depth });
      walk(item.menuId, depth + 1);
    }
  };

  walk(0, 0);

  // Safety net: append rows that are unreachable from the root (orphans or cyclic parentIds)
  for (const item of items) {
    if (!visited.has(item.menuId)) {
      rows.push({ ...item, depth: 0 });
      walk(item.menuId, 1);
    }
  }

  return rows;
}

export const useMenuStore = defineStore(SetupStoreId.Menu, () => {
  const menus = ref<Api.RuoYi.Menu[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false);

  const flatMenus = computed(() => flattenMenus(menus.value));

  /** Load the flat menu rows from the RuoYi /system/menu/list endpoint */
  async function loadMenus() {
    if (isLoaded.value || isLoading.value) {
      return;
    }

    isLoading.value = true;

    const { data, error } = await fetchGetMenuList();

    menus.value = error ? [] : data;
    isLoaded.value = !error;
    isLoading.value = false;
  }

  async function reloadMenus() {
    isLoaded.value = false;

    await loadMenus();
  }

  /** Create a menu, it returns whether the mutation succeeded */
  async function createMenu(input: Api.Menu.Create) {
    const { error } = await fetchCreateMenu(input);

    if (!error) {
      await reloadMenus();
    }

    return !error;
  }

  /** Update a menu, it returns whether the mutation succeeded */
  async function updateMenu(input: Api.Menu.Update) {
    const { error } = await fetchUpdateMenu(input);

    if (!error) {
      await reloadMenus();
    }

    return !error;
  }

  /** Remove a menu, it returns whether the mutation succeeded */
  async function removeMenu(menuId: number) {
    const { error } = await fetchDeleteMenu(menuId);

    if (!error) {
      await reloadMenus();
    }

    return !error;
  }

  /**
   * Toggle the RuoYi menu status ("0" enabled, "1" disabled)
   *
   * RuoYi has no menu status endpoint, so the full menu payload is sent with the flipped status.
   */
  async function toggleStatus(menuId: number) {
    const target = menus.value.find((item) => item.menuId === menuId);

    if (!target) {
      return false;
    }

    const input: Api.Menu.Update = {
      menuId: target.menuId,
      menuName: target.menuName,
      parentId: target.parentId,
      orderNum: target.orderNum,
      path: target.path,
      component: target.component,
      query: target.query,
      routeName: target.routeName,
      isFrame: target.isFrame,
      isCache: target.isCache,
      menuType: target.menuType,
      visible: target.visible,
      status: target.status === '0' ? '1' : '0',
      perms: target.perms,
      icon: target.icon,
    };

    const { error } = await fetchUpdateMenu(input);

    if (!error) {
      await reloadMenus();
    }

    return !error;
  }

  return {
    menus,
    flatMenus,
    isLoading,
    isLoaded,
    loadMenus,
    reloadMenus,
    createMenu,
    updateMenu,
    removeMenu,
    toggleStatus,
  };
});
