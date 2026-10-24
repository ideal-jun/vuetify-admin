import { localStg } from '@/utils/storage';

import type { RequestInstanceState } from './type';

/** Get the Authorization header value */
export function getAuthorization() {
  const token = localStg.get('token');

  return token ? `Bearer ${token}` : null;
}

/** Show an error message and keep the message stack deduplicated */
export function showErrorMsg(state: RequestInstanceState, message: string) {
  const isExist = state.errMsgStack.includes(message);

  if (isExist) {
    return;
  }

  state.errMsgStack.push(message);

  window.$message?.error(message);

  // The message is a transient notification; release the dedupe slot after a while.
  setTimeout(() => {
    state.errMsgStack = state.errMsgStack.filter((msg) => msg !== message);
  }, 5000);
}
