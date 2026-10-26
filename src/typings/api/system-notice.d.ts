declare namespace Api {
  /**
   * namespace SystemManage — notice endpoints
   */
  namespace SystemManage {
    /** backend notice type: "1" notice, "2" announcement */
    type NoticeType = '1' | '2';

    /** backend notice status: "0" normal, "1" closed */
    type NoticeStatus = '0' | '1';

    /** Notice returned by /system/notice endpoints */
    interface Notice {
      noticeId: number;
      noticeTitle: string;
      noticeType: NoticeType;
      noticeContent: string;
      status: NoticeStatus;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
      remark?: string | null;
    }

    type NoticeList = Api.Backend.TableData<Notice>;

    /** The search model kept by the notice search panel */
    type NoticeSearchModel = {
      noticeTitle: string | null;
      createBy: string | null;
      noticeType: NoticeType | null;
      /** The start of the createdAt range, as yyyy-MM-dd */
      beginTime: string | null;
      /** The end of the createdAt range, as yyyy-MM-dd */
      endTime: string | null;
    };

    /** The query params sent to /system/notice/list (dates are sent in the backend's params[...] form) */
    type NoticeSearchParams = Pick<NoticeSearchModel, 'noticeTitle' | 'createBy' | 'noticeType'> & {
      pageNum: number;
      pageSize: number;
      'params[beginTime]'?: string;
      'params[endTime]'?: string;
    };

    /** The notice fields edited by the operate drawer */
    type NoticeForm = {
      noticeTitle: string;
      noticeType: NoticeType;
      noticeContent: string;
      status: NoticeStatus;
    };

    type CreateNotice = NoticeForm;

    type UpdateNotice = NoticeForm & Pick<Notice, 'noticeId'>;
  }
}
