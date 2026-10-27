import { getServiceBaseURL } from '@/utils/service';

import { getAuthorization } from './shared';

/**
 * Upload a multipart file through the same base URL and token as the JSON client.
 */
export async function uploadFile(config: {
  url: string;
  file: File;
  fieldName?: string;
  params?: Record<string, unknown>;
}) {
  const isProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
  const { baseURL } = getServiceBaseURL(isProxy);
  const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(config.params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  const url = `${baseURL.replace(/\/$/u, '')}${path}${query ? `?${query}` : ''}`;
  const formData = new FormData();

  formData.append(config.fieldName ?? 'file', config.file);

  const headers = new Headers();
  const authorization = getAuthorization();

  if (authorization) {
    headers.set('Authorization', authorization);
  }

  const response = await fetch(url, { method: 'POST', headers, body: formData });
  const text = await response.text();
  let payload: { code?: number | string; msg?: string; data?: unknown };

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || `Upload failed: HTTP ${response.status}`);
  }

  if (!response.ok || (payload.code !== undefined && String(payload.code) !== '200')) {
    throw new Error(payload.msg || `Upload failed: HTTP ${response.status}`);
  }

  return { message: payload.msg ?? '', data: payload.data };
}
