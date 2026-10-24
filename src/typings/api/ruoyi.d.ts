declare namespace Api {
  /**
   * namespace RuoYi
   *
   * The application consumes the RuoYi-Cloud response shapes directly: the types below mirror the backend DTOs and are
   * used by the service layer, the stores and the views without an intermediate mapping layer.
   */
  namespace RuoYi {
    /** RuoYi status: "0" normal, "1" disabled */
    type Status = '0' | '1';

    /** RuoYi sex: "0" male, "1" female, "2" unknown */
    type Sex = '0' | '1' | '2';

    /** RuoYi menu type: "M" directory, "C" menu, "F" button */
    type MenuType = 'M' | 'C' | 'F';

    /** RuoYi visible flag: "0" visible, "1" hidden */
    type Visible = '0' | '1';

    /** A flat paginated RuoYi response (no "data" envelope) */
    interface TableData<T> {
      code: number;
      msg: string;
      total: number;
      rows: T[];
    }

    /** Department returned on user rows */
    interface Dept {
      deptId: number;
      parentId?: number | null;
      ancestors?: string | null;
      deptName: string;
      orderNum?: number | null;
      leader?: string | null;
      phone?: string | null;
      email?: string | null;
      status?: Status | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
      children?: Dept[];
    }

    /** Role returned by /system/role endpoints */
    interface Role {
      roleId: number;
      roleName: string;
      roleKey: string;
      roleSort: number;
      dataScope?: string | null;
      status: Status;
      remark?: string | null;
      admin?: boolean;
      menuIds?: number[] | null;
      deptIds?: number[] | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
    }

    /** User returned by /system/user endpoints */
    interface User {
      userId: number;
      deptId?: number | null;
      userName: string;
      nickName: string;
      email?: string | null;
      phonenumber?: string | null;
      sex?: Sex | null;
      avatar?: string | null;
      status?: Status | null;
      delFlag?: string | null;
      loginIp?: string | null;
      loginDate?: string | null;
      dept?: Dept | null;
      roles?: Role[];
      roleIds?: number[] | null;
      postIds?: number[] | null;
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
      remark?: string | null;
    }

    /** Menu returned by /system/menu/list and getRouters */
    interface Menu {
      menuId: number;
      menuName: string;
      parentId: number;
      orderNum: number;
      path?: string | null;
      component?: string | null;
      query?: string | null;
      routeName?: string | null;
      isFrame?: string | null;
      isCache?: string | null;
      menuType: MenuType;
      visible: Visible;
      status: Status;
      perms?: string | null;
      icon?: string | null;
      children?: Menu[];
      createBy?: string | null;
      createTime?: string | null;
      updateBy?: string | null;
      updateTime?: string | null;
    }

    /** GET /system/user/getInfo */
    interface GetInfo {
      code: number;
      msg: string;
      user: User;
      roles: string[];
      permissions: string[];
      pwdChrtype?: string;
      isDefaultModifyPwd?: boolean;
      isPasswordExpired?: boolean;
    }

    /** GET /code */
    interface Captcha {
      code: number;
      msg: string;
      img: string;
      uuid: string;
      captchaEnabled: boolean;
    }

    /** POST /auth/login */
    interface LoginData {
      access_token: string;
      expires_in: number;
    }

    /** Query params of /system/user/list */
    interface UserQuery {
      pageNum?: number;
      pageSize?: number;
      userName?: string;
      phonenumber?: string;
      status?: Status;
    }

    /** Query params of /system/role/list */
    interface RoleQuery {
      pageNum?: number;
      pageSize?: number;
      roleName?: string;
      roleKey?: string;
      status?: Status;
    }

    /** Payload of POST/PUT /system/user */
    interface UserPayload {
      userId?: number;
      userName: string;
      nickName: string;
      sex?: Sex;
      phonenumber?: string;
      email?: string;
      status?: Status;
      roleIds?: number[];
      deptId?: number;
      password?: string;
    }

    /** Payload of POST/PUT /system/role */
    interface RolePayload {
      roleId?: number;
      roleName: string;
      roleKey: string;
      roleSort?: number;
      status?: Status;
      remark?: string;
      menuIds?: number[];
    }

    /** Payload of POST/PUT /system/menu */
    interface MenuPayload {
      menuId?: number;
      menuName: string;
      parentId: number;
      orderNum: number;
      path?: string;
      component?: string | null;
      menuType: MenuType;
      visible?: Visible;
      status?: Status;
      perms?: string;
      icon?: string;
      isFrame?: string;
      isCache?: string;
      query?: string;
    }
    /** A router entry returned by GET /system/menu/getRouters */
    interface RouterRecord {
      name: string;
      path: string;
      hidden?: boolean;
      redirect?: string;
      component?: string;
      alwaysShow?: boolean;
      meta?: RouterMeta;
      children?: RouterRecord[];
    }

    /** Meta of a getRouters entry */
    interface RouterMeta {
      title?: string;
      icon?: string;
      noCache?: boolean;
      link?: string | null;
    }
  }
}
