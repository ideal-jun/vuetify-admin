declare namespace Api {
  namespace Backend {
    /** Flat response of GET /system/user/profile */
    interface ProfileResponse {
      code: number;
      msg: string;
      data: User;
      roleGroup?: string;
      postGroup?: string;
    }

    /** The composed profile consumed by the profile page */
    interface Profile {
      user: User;
      roleGroup: string;
      postGroup: string;
    }

    /** Payload of PUT /system/user/profile */
    interface ProfileForm {
      nickName: string;
      email?: string;
      phonenumber?: string;
      sex?: Sex;
    }

    /** Payload of PUT /system/user/profile/updatePwd */
    interface ProfilePwdForm {
      oldPassword: string;
      newPassword: string;
    }
  }
}
