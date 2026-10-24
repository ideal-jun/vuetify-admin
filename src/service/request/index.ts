import { env } from '@/env';
import { $t } from '@/locales';
import { getServiceBaseURL } from '@/utils/service';

import { getAuthorization, showErrorMsg } from './shared';
import type { RequestHandlers, RequestInstanceState } from './type';

export const BACKEND_ERROR_CODE = 'BACKEND_ERROR';

const state: RequestInstanceState = {
  errMsgStack: [],
};

let handlers: RequestHandlers = {};

/** Register the auth handlers used by the request layer */
export function setupRequestHandlers(nextHandlers: RequestHandlers) {
  handlers = nextHandlers;
}

/** Get the request instance state */
export function getRequestState() {
  return state;
}

function getURL(config: App.Service.RequestConfig, baseURL: string) {
  const path = config.url.startsWith('/') ? config.url : `/${config.url}`;

  const url = `${baseURL.replace(/\/$/u, '')}${path}`;

  if (!config.params) {
    return url;
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(config.params)) {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  }

  const query = search.toString();

  return query ? `${url}?${query}` : url;
}

function createError(
  code: string,
  message: string,
  status?: number,
  response?: App.Service.Response,
): { data: null; error: App.Service.RequestError; response?: App.Service.Response } {
  return {
    data: null,
    error: { code, message, status },
    response,
  };
}

/**
 * Handle a failed HTTP response
 *
 * A 401 means the backend rejected the credentials, so the session is reset and a single flat error is reported.
 */
async function handleHttpError<T>(
  payload: unknown,
  status: number,
): Promise<App.Service.FlatResponseData<T>> {
  const backendPayload = payload as Partial<App.Service.Response> | null;
  const message = backendPayload?.msg || $t('request.serverError');

  if (status === 401) {
    await handlers.onUnauthorized?.();

    showErrorMsg(state, message);

    return createError(
      String(backendPayload?.code ?? status),
      message,
      status,
      backendPayload as unknown as App.Service.Response | undefined,
    );
  }

  showErrorMsg(state, message);

  return createError(BACKEND_ERROR_CODE, message, status);
}

/** Handle the backend code of a successful HTTP response */
async function handleBackendCode<T>(
  responseCode: string,
  backendResponse: App.Service.Response<T>,
  status: number | undefined,
): Promise<App.Service.FlatResponseData<T>> {
  // A 401 body code means the session is invalid, even when it is not listed in the logout codes.
  if (responseCode === '401') {
    await handlers.onUnauthorized?.();

    return createError(
      responseCode,
      backendResponse.msg || $t('request.logoutMsg'),
      status,
      backendResponse,
    );
  }

  if (env.serviceCodes.logout.includes(responseCode)) {
    await handlers.onUnauthorized?.();

    return createError(
      responseCode,
      backendResponse.msg || $t('request.logoutMsg'),
      status,
      backendResponse,
    );
  }

  if (env.serviceCodes.modalLogout.includes(responseCode)) {
    window.$dialog?.error({
      title: $t('request.logoutWithModal'),
      content: backendResponse.msg || $t('request.logoutWithModalMsg'),
      positiveText: $t('common.confirm'),
      maskClosable: false,
      onPositiveClick: () => {
        void handlers.onUnauthorized?.();
      },
    });

    return createError(responseCode, backendResponse.msg, status, backendResponse);
  }

  showErrorMsg(state, backendResponse.msg || $t('request.serverError'));

  return createError(
    responseCode,
    backendResponse.msg || $t('request.serverError'),
    status,
    backendResponse,
  );
}

/** The request pipeline keeps the backend code handling in one place */
async function execute<T>(
  config: App.Service.RequestConfig,
): Promise<App.Service.FlatResponseData<T>> {
  const {
    url: _url,
    params: _params,
    data,
    withToken,
    method: _method,
    headers: configHeaders,
    ...init
  } = config;

  const method = config.method || 'GET';

  const headers = new Headers(configHeaders);

  if (withToken !== false) {
    const authorization = getAuthorization();

    if (authorization) {
      headers.set('Authorization', authorization);
    }
  }

  let body: BodyInit | undefined;

  if (data !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(data);
  }

  const isProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
  const { baseURL } = getServiceBaseURL(isProxy);

  const requestURL = getURL(config, baseURL);

  try {
    const response = await fetch(requestURL, {
      ...init,
      method,
      headers,
      body,
    });

    const text = await response.text();

    let payload: unknown = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      return handleHttpError<T>(payload, response.status);
    }

    const backendResponse = payload as App.Service.Response<T> | null;

    // A plain JSON payload is returned as-is, which makes the request layer usable with any REST API.
    if (!backendResponse || typeof backendResponse !== 'object' || !('code' in backendResponse)) {
      return { data: payload as T, error: null };
    }

    const responseCode = String(backendResponse.code);

    if (responseCode === env.serviceCodes.success) {
      // backend returns flat payloads for getInfo and table endpoints; expose them directly as data.
      const data = 'data' in backendResponse ? backendResponse.data : backendResponse;

      return { data: data as T, error: null, response: backendResponse };
    }

    return handleBackendCode(responseCode, backendResponse, response.status);
  } catch (error) {
    const message = error instanceof Error ? error.message : $t('request.networkError');

    showErrorMsg(state, message);

    return createError(BACKEND_ERROR_CODE, message);
  }
}

/** The flat request instance */
export const request: App.Service.FlatRequest = async <T>(config: App.Service.RequestConfig) => {
  return execute<T>(config);
};
