declare namespace Api {
  /**
   * namespace Menu
   *
   * The menu management module uses the backend menu fields directly.
   */
  namespace Menu {
    type Record = Api.Backend.Menu;

    type Create = Omit<Record, 'menuId' | 'children' | 'createBy' | 'createTime'>;

    type Update = Create & Pick<Record, 'menuId'>;

    /** The menu search model kept by the menu search panel */
    type SearchModel = {
      menuName: string | null;
      status: Api.Backend.Status | null;
    };
  }
}
