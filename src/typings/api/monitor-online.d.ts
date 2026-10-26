declare namespace Api {
  /**
   * namespace MonitorOnline
   *
   * The online users page talks to the backend fields directly.
   */
  namespace MonitorOnline {
    /** A signed-in user session returned by GET /system/online/list */
    interface OnlineUser {
      tokenId: string;
      userName: string;
      deptName?: string | null;
      ipaddr?: string | null;
      loginLocation?: string | null;
      browser?: string | null;
      os?: string | null;
      /** Login time as a backend timestamp in milliseconds */
      loginTime?: number | null;
    }

    type OnlineList = Api.Backend.TableData<OnlineUser>;

    /** The search model kept by the online search panel */
    type SearchModel = {
      userName: string | null;
      ipaddr: string | null;
    };

    /** The query params sent to /system/online/list */
    type SearchParams = SearchModel & {
      pageNum: number;
      pageSize: number;
    };
  }
}
