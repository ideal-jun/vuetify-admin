import { localStg } from '@/utils/storage';

/** Get the token */
export function getToken() {
  return localStg.get('token') || '';
}

/** Clear the auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
}
