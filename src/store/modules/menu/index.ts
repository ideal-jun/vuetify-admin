import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SetupStoreId } from '@/enum';

import { mockMenus } from './mock';

export type MenuTableRow = Api.Menu.Record & {
  depth: number;
};

function cloneMenus(items: Api.Menu.Record[]): Api.Menu.Record[] {
  return structuredClone(items);
}

function flattenMenus(items: Api.Menu.Record[], depth = 0): MenuTableRow[] {
  return items.flatMap((item) => [
    { ...item, depth },
    ...(item.children ? flattenMenus(item.children, depth + 1) : []),
  ]);
}

function insertMenu(
  items: Api.Menu.Record[],
  parentId: string | null,
  menu: Api.Menu.Record,
): boolean {
  if (parentId === null) {
    items.push(menu);

    return true;
  }

  for (const item of items) {
    if (item.id === parentId) {
      item.children = [...(item.children ?? []), menu];

      return true;
    }

    if (item.children && insertMenu(item.children, parentId, menu)) {
      return true;
    }
  }

  return false;
}

function updateMenu(items: Api.Menu.Record[], id: string, input: Api.Menu.Update): boolean {
  for (const item of items) {
    if (item.id === id) {
      item.title = input.title;
      item.path = input.path;
      item.icon = input.icon;
      item.permission = input.permission;
      item.type = input.type;
      item.sort = input.sort;
      item.status = input.status;

      return true;
    }

    if (item.children && updateMenu(item.children, id, input)) {
      return true;
    }
  }

  return false;
}

function removeMenu(items: Api.Menu.Record[], id: string): boolean {
  const index = items.findIndex((item) => item.id === id);

  if (index !== -1) {
    items.splice(index, 1);

    return true;
  }

  return items.some((item) => item.children && removeMenu(item.children, id));
}

function toggleMenuStatus(items: Api.Menu.Record[], id: string): boolean {
  for (const item of items) {
    if (item.id === id) {
      item.status = item.status === 'enabled' ? 'disabled' : 'enabled';

      return true;
    }

    if (item.children && toggleMenuStatus(item.children, id)) {
      return true;
    }
  }

  return false;
}

export const useMenuStore = defineStore(SetupStoreId.Menu, () => {
  const menus = ref<Api.Menu.Record[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false);

  const flatMenus = computed(() => flattenMenus(menus.value));

  async function loadMenus() {
    if (isLoaded.value || isLoading.value) {
      return;
    }

    isLoading.value = true;

    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });

    menus.value = cloneMenus(mockMenus);
    isLoaded.value = true;
    isLoading.value = false;
  }

  async function reloadMenus() {
    isLoaded.value = false;

    await loadMenus();
  }

  function createMenu(input: Api.Menu.Create) {
    const menu: Api.Menu.Record = {
      ...input,
      id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    if (!insertMenu(menus.value, input.parentId, menu)) {
      menus.value.push(menu);
    }
  }

  function updateMenuById(id: string, input: Api.Menu.Update) {
    updateMenu(menus.value, id, input);
  }

  function removeMenuById(id: string) {
    removeMenu(menus.value, id);
  }

  function toggleStatus(id: string) {
    toggleMenuStatus(menus.value, id);
  }

  return {
    menus,
    flatMenus,
    isLoading,
    isLoaded,
    loadMenus,
    reloadMenus,
    createMenu,
    updateMenu: updateMenuById,
    removeMenu: removeMenuById,
    toggleStatus,
  };
});
