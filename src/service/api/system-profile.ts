import { request } from '../request';

/** Current user profile payload returned by GET /system/user/profile */
export type ProfilePayload = Api.Backend.ProfileResponse;

/**
 * Get the current user profile
 *
 * The backend returns the user under "data" plus the role/post group labels at the top level, so the service composes a
 * single typed profile object from the response.
 */
export async function fetchGetProfile() {
  const result = await request<Api.Backend.User>({ url: '/system/user/profile' });

  if (result.error) {
    return { data: null, error: result.error, response: result.response };
  }

  const payload = (result.response ?? {}) as Partial<ProfilePayload>;

  return {
    data: {
      user: (payload.data ?? result.data) as Api.Backend.User,
      roleGroup: payload.roleGroup ?? '',
      postGroup: payload.postGroup ?? '',
    },
    error: null,
    response: result.response,
  };
}

/** Update the current user profile */
export function fetchUpdateProfile(data: Api.Backend.ProfileForm) {
  return request<null>({ url: '/system/user/profile', method: 'PUT', data });
}

/** Change the current user password */
export function fetchUpdateProfilePwd(data: Api.Backend.ProfilePwdForm) {
  return request<null>({ url: '/system/user/profile/updatePwd', method: 'PUT', data });
}
