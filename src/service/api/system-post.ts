import { request } from '../request';

/**
 * Get the post list
 *
 * @param params The search params and the pagination params
 */
export function fetchGetPostList(params: Api.SystemManage.PostSearchParams) {
  return request<Api.SystemManage.PostList>({
    url: '/system/post/list',
    params: params as unknown as Record<string, unknown>,
  });
}

/**
 * Get the post detail
 *
 * @param postId The post id
 */
export function fetchGetPost(postId: number) {
  return request<Api.SystemManage.Post>({ url: `/system/post/${postId}` });
}

/** Get the post options used by the user form */
export function fetchGetPostOptions() {
  return request<Api.SystemManage.AllPost[]>({ url: '/system/post/optionselect' });
}

/**
 * Create a post
 *
 * @param data The post data
 */
export function fetchCreatePost(data: Api.SystemManage.CreatePost) {
  return request<null>({ url: '/system/post', method: 'POST', data });
}

/**
 * Update a post
 *
 * @param data The post data, including the post id
 */
export function fetchUpdatePost(data: Api.SystemManage.UpdatePost) {
  return request<null>({ url: '/system/post', method: 'PUT', data });
}

/**
 * Delete a post
 *
 * @param postId The post id
 */
export function fetchDeletePost(postId: number) {
  return request<null>({ url: `/system/post/${postId}`, method: 'DELETE' });
}

/**
 * Batch delete posts
 *
 * @param postIds The post ids
 */
export function fetchBatchDeletePost(postIds: number[]) {
  return request<null>({ url: `/system/post/${postIds.join(',')}`, method: 'DELETE' });
}
