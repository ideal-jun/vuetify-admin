declare namespace Api {
  /**
   * namespace SystemManage
   *
   * The system management views talk to RuoYi fields directly; the aliases below keep the view imports short.
   */
  namespace SystemManage {
    type User = Api.RuoYi.User;
    type Role = Api.RuoYi.Role;
    type Menu = Api.RuoYi.Menu;

    type UserList = Api.RuoYi.TableData<User>;
    type RoleList = Api.RuoYi.TableData<Role>;

    type AllRole = Pick<Role, 'roleId' | 'roleName' | 'roleKey'>;

    /** The search model kept by the user search panel */
    type UserSearchModel = {
      userName: string | null;
      phonenumber: string | null;
      status: Api.RuoYi.Status | null;
    };

    /** The query params sent to /system/user/list */
    type UserSearchParams = UserSearchModel & {
      pageNum: number;
      pageSize: number;
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
      status: Api.RuoYi.Status | null;
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
