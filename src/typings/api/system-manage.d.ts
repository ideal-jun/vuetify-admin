declare namespace Api {
  /**
   * namespace SystemManage
   *
   * The system management views talk to backend fields directly; the aliases below keep the view imports short.
   */
  namespace SystemManage {
    type User = Api.Backend.User;
    type Role = Api.Backend.Role;
    type Menu = Api.Backend.Menu;

    type UserList = Api.Backend.TableData<User>;
    type RoleList = Api.Backend.TableData<Role>;

    type AllRole = Pick<Role, 'roleId' | 'roleName' | 'roleKey'>;

    /** The search model kept by the user search panel */
    type UserSearchModel = {
      userName: string | null;
      phonenumber: string | null;
      status: Api.Backend.Status | null;
      beginTime?: string | null;
      endTime?: string | null;
    };

    /** The query params sent to /system/user/list */
    type UserSearchParams = UserSearchModel & {
      pageNum: number;
      pageSize: number;
      deptId?: number;
      'params[beginTime]'?: string;
      'params[endTime]'?: string;
    };

    /** The user fields that can be created or updated */
    type UserForm = Pick<
      User,
      'userName' | 'nickName' | 'sex' | 'phonenumber' | 'email' | 'status' | 'roleIds'
    > & {
      /** The initial password used on create */
      password?: string;
    };

    type CreateUser = UserForm;
    type UpdateUser = UserForm & Pick<User, 'userId'>;

    /** The search model kept by the role search panel */
    type RoleSearchModel = {
      roleName: string | null;
      roleKey: string | null;
      status: Api.Backend.Status | null;
    };

    type RoleSearchParams = RoleSearchModel & {
      pageNum: number;
      pageSize: number;
    };

    type RoleForm = Pick<Role, 'roleName' | 'roleKey' | 'roleSort' | 'status' | 'remark'>;

    type CreateRole = RoleForm;
    type UpdateRole = RoleForm & Pick<Role, 'roleId'>;
  }
}
