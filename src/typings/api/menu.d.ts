declare namespace Api {
  /**
   * namespace Menu
   *
   * The business menu management module, not the router menu.
   */
  namespace Menu {
    type Record = {
      id: string;
      parentId: string | null;
      title: string;
      path: string;
      icon: string;
      /** the permission identifier, required for button menus */
      permission: string;
      type: UnionKey.MenuType;
      sort: number;
      status: UnionKey.MenuStatus;
      children?: Record[];
    };

    type Create = Omit<Record, 'children' | 'id'>;

    type Update = Create;

    /** the menu search model kept by the menu search panel */
    type SearchModel = {
      /** menu title */
      title: string | null;
      /** route path */
      path: string | null;
      /** menu status */
      status: UnionKey.MenuStatus | null;
    };
  }
}
