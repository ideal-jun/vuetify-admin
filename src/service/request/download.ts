import { getServiceBaseURL } from '@/utils/service';

import { getAuthorization } from './shared';

/**
 * Download a binary response (Excel export, template, ...) through the same base URL and token as the JSON client.
 */
export async function downloadFile(config: {
  url: string;
  params?: Record<string, unknown>;
  filename?: string;
  method?: 'GET' | 'POST';
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

  const headers = new Headers();
  const authorization = getAuthorization();

  if (authorization) {
    headers.set('Authorization', authorization);
  }

  const response = await fetch(url, { method: config.method ?? 'GET', headers });

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as { msg?: string };
    throw new Error(payload.msg || 'Download failed');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="?([^";]+)/iu);
  const fallback = config.filename || 'download';
  const filename = match?.[1] ? decodeURIComponent(match[1]) : fallback;

  const objectURL = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectURL;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectURL);
}
