declare namespace Api {
  /**
   * namespace ToolGen
   *
   * Code generation endpoints of the tool module.
   */
  namespace ToolGen {
    /** The generation template: single table, tree table or master-detail */
    type TplCategory = 'crud' | 'tree' | 'sub';

    /** The front-end template of the generated code */
    type TplWebType = 'element-ui' | 'element-plus' | 'element-plus-typescript';

    /** The generation type: "0" zip archive, "1" custom path */
    type GenType = '0' | '1';

    /** A column row of a generated table (gen_table_column) */
    interface Column {
      columnId: number | null;
      tableId?: number | null;
      columnName: string | null;
      columnComment: string | null;
      columnType: string | null;
      javaType: string | null;
      javaField: string | null;
      isPk: string | null;
      isIncrement?: string | null;
      isRequired: string | null;
      isInsert: string | null;
      isEdit: string | null;
      isList: string | null;
      isQuery: string | null;
      queryType: string | null;
      htmlType: string | null;
      dictType: string | null;
      sort?: number | null;
      /** Derived read-only flags returned by the backend */
      pk?: boolean;
      increment?: boolean;
      required?: boolean;
      insert?: boolean;
      edit?: boolean;
      list?: boolean;
      query?: boolean;
      usableColumn?: boolean;
      superColumn?: boolean;
      capJavaField?: string | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
      remark?: string | null;
    }

    /** A generation config row (gen_table) */
    interface GenTable {
      tableId: number;
      tableName: string;
      tableComment: string;
      subTableName?: string | null;
      subTableFkName?: string | null;
      className: string;
      tplCategory?: TplCategory | null;
      tplWebType?: TplWebType | null;
      packageName: string;
      moduleName: string;
      businessName: string;
      functionName: string;
      functionAuthor: string;
      genType?: GenType | null;
      genPath?: string | null;
      columns?: Column[] | null;
      options?: string | null;
      treeCode?: string | null;
      treeParentCode?: string | null;
      treeName?: string | null;
      parentMenuId?: number | null;
      parentMenuName?: string | null;
      /** Derived from the generation options: also generate a detail view */
      view?: boolean | null;
      pkColumn?: Column | null;
      subTable?: GenTable | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
      remark?: string | null;
    }

    /** A database table that can be imported, it has no generation id yet */
    type DbTable = Omit<GenTable, 'tableId'> & {
      tableId: number | null;
    };

    type GenTableList = Api.Backend.TableData<GenTable>;

    type DbTableList = Api.Backend.TableData<DbTable>;

    /** The search model kept by the table search panel */
    interface GenTableSearchModel {
      tableName: string | null;
      tableComment: string | null;
    }

    type GenTableSearchParams = GenTableSearchModel & {
      pageNum: number;
      pageSize: number;
    };

    type DbTableSearchParams = GenTableSearchParams;

    /** GET /code/gen/{tableId} */
    interface Detail {
      /** The generation config */
      info: GenTable;
      /** The column rows of the table */
      rows: Column[];
      /** All imported generation configs, used as the sub table candidates */
      tables: GenTable[];
    }

    /** The payload of PUT /code/gen */
    type UpdatePayload = Omit<GenTable, 'columns'> & {
      columns: Column[];
      /** The generation options that the backend serializes into gen_table.options */
      params: Record<string, unknown>;
    };

    /** The query params of POST /code/gen/importTable */
    interface ImportParams {
      /** The comma separated table names */
      tables: string;
      /** The front-end template the imported tables are generated with */
      tplWebType: TplWebType;
    }

    /** The map returned by GET /code/gen/preview/{tableId}: template path -> rendered source */
    type PreviewMap = Record<string, string>;
  }
}
