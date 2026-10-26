declare namespace Api {
  /**
   * namespace SystemOperlog
   *
   * Operation log endpoints of the system monitor module.
   */
  namespace SystemOperlog {
    /** An operation log row */
    interface Operlog {
      operId: number;
      title: string;
      businessType: number;
      method?: string | null;
      requestMethod?: string | null;
      operatorType?: number | null;
      operName?: string | null;
      deptName?: string | null;
      operUrl?: string | null;
      operIp?: string | null;
      operLocation?: string | null;
      operParam?: string | null;
      jsonResult?: string | null;
      status: Api.Backend.Status;
      errorMsg?: string | null;
      operTime?: string | null;
      costTime?: number | null;
    }

    type OperlogList = Api.Backend.TableData<Operlog>;

    /** The search model kept by the operation log search panel */
    interface SearchModel {
      title: string | null;
      operName: string | null;
      businessType: number | null;
      status: Api.Backend.Status | null;
      beginTime: string | null;
      endTime: string | null;
    }

    type SearchParams = SearchModel & {
      pageNum: number;
      pageSize: number;
    };
  }
}
