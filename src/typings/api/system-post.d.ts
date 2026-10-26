declare namespace Api {
  /**
   * namespace SystemManage — post endpoints
   */
  namespace SystemManage {
    /** Post returned by /system/post endpoints */
    interface Post {
      postId: number;
      postCode: string;
      postName: string;
      postSort: number;
      status: Api.Backend.Status;
      remark?: string | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
    }

    type PostList = Api.Backend.TableData<Post>;

    type AllPost = Pick<Post, 'postId' | 'postCode' | 'postName'>;

    /** The search model kept by the post search panel */
    type PostSearchModel = {
      postCode: string | null;
      postName: string | null;
      status: Api.Backend.Status | null;
    };

    type PostSearchParams = PostSearchModel & {
      pageNum: number;
      pageSize: number;
    };

    /** The post fields edited by the operate drawer */
    type PostForm = {
      postCode: string;
      postName: string;
      postSort: number;
      status: Api.Backend.Status;
      remark: string;
    };

    type CreatePost = PostForm;

    type UpdatePost = PostForm & Pick<Post, 'postId'>;
  }
}
