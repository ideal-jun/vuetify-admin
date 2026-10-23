import { localStg } from '@/utils/storage';

import type { RequestInstanceState } from './type';

/** Get the Authorization header value */
export function getAuthorization() {
  const token = localStg.get('token');

  return token ? `Bearer ${token}` : null;
}

/** Show an error message and keep the message stack deduplicated */
export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (state.errMsgStack.length === 0) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message);

    // The message is a transient notification; release the dedupe slot after a while.
    setTimeout(() => {
      state.errMsgStack = state.errMsgStack.filter((msg) => msg !== message);
    }, 5000);
  }
}

/**
 * Refresh the token once even when multiple requests fail at the same time
 *
 * @param state Request instance state
 * @param refresh The refresh callback
 */
export async function handleExpiredRequest(
  state: RequestInstanceState,
  refresh: () => Promise<boolean>,
) {
  if (!state.refreshTokenPromise) {
    state.refreshTokenPromise = refresh();
  }

  const success = await state.refreshTokenPromise;

  setTimeout(() => {
    state.refreshTokenPromise = null;
  }, 1000);

  return success;
}
