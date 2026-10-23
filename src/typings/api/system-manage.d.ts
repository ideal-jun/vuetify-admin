declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
      /** the count of users bound to the role */
      userCount: number;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Role, 'roleName' | 'roleCode' | 'status'> & Common.CommonSearchParams
    > & {
      /** the field to sort by */
      sortBy?: string | null;
      /** the sort direction */
      sortOrder?: 'asc' | 'desc' | null;
    };

    /** the search model kept by the role search panel */
    type RoleSearchModel = Omit<RoleSearchParams, 'current' | 'size' | 'sortBy' | 'sortOrder'>;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** the enabled roles used by the user form */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /** the role fields that can be created or updated */
    type RoleForm = Pick<Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;

    /** create role params */
    type CreateRole = RoleForm;

    /** update role params */
    type UpdateRole = RoleForm & Pick<Role, 'id'>;

    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      userName: string;
      /** user gender */
      userGender: UserGender | null;
      /** user nick name */
      nickName: string;
      /** user phone */
      userPhone: string;
      /** user email */
      userEmail: string;
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
        Common.CommonSearchParams
    > & {
      /** the field to sort by */
      sortBy?: string | null;
      /** the sort direction */
      sortOrder?: 'asc' | 'desc' | null;
    };

    /** the search model kept by the search panel, pagination and sorting are owned by the data table */
    type UserSearchModel = Omit<UserSearchParams, 'current' | 'size' | 'sortBy' | 'sortOrder'>;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /** the user fields that can be created or updated */
    type UserForm = Pick<
      User,
      'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
    >;

    /** create user params */
    type CreateUser = UserForm;

    /** update user params */
    type UpdateUser = UserForm & Pick<User, 'id'>;
  }
}
