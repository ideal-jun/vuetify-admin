declare namespace Api {
  /**
   * namespace SystemLogininfor
   *
   * Login log endpoints of the system monitor module.
   */
  namespace SystemLogininfor {
    /** A login log row */
    interface Logininfor {
      infoId: number;
      userName?: string | null;
      ipaddr?: string | null;
      loginLocation?: string | null;
      browser?: string | null;
      os?: string | null;
      status: Api.Backend.Status;
      msg?: string | null;
      accessTime?: string | null;
    }

    type LogininforList = Api.Backend.TableData<Logininfor>;

    /** The search model kept by the login log search panel */
    interface SearchModel {
      userName: string | null;
      ipaddr: string | null;
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
