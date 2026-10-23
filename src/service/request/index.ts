import { env } from '@/env';
import { $t } from '@/locales';
import { getServiceBaseURL } from '@/utils/service';

import { handleMockRequest } from '../mock';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { RequestHandlers, RequestInstanceState } from './type';

export const BACKEND_ERROR_CODE = 'BACKEND_ERROR';

const state: RequestInstanceState = {
  errMsgStack: [],
  refreshTokenPromise: null,
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

// The request pipeline intentionally keeps the backend code handling in one place.
// eslint-disable-next-line complexity
async function execute<T>(
  config: App.Service.RequestConfig,
  allowRetry = true,
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
    // The built-in mock service keeps the template runnable without a backend.
    if (env.isMock) {
      const mockResponse = await handleMockRequest<T>(config);

      if (mockResponse.error) {
        showErrorMsg(state, mockResponse.error.message);
      }

      return mockResponse;
    }

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
      const backendPayload = payload as Partial<App.Service.Response> | null;
      const message = backendPayload?.msg || $t('request.serverError');

      showErrorMsg(state, message);

      return createError(BACKEND_ERROR_CODE, message, response.status);
    }

    const backendResponse = payload as App.Service.Response<T> | null;

    // A plain JSON payload is returned as-is, which makes the request layer usable with any REST API.
    if (!backendResponse || typeof backendResponse !== 'object' || !('code' in backendResponse)) {
      return { data: payload as T, error: null };
    }

    const responseCode = String(backendResponse.code);

    if (responseCode === import.meta.env.VITE_SERVICE_SUCCESS_CODE) {
      return { data: backendResponse.data, error: null, response: backendResponse };
    }

    const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];

    if (logoutCodes.includes(responseCode)) {
      await handlers.onUnauthorized?.();

      return createError(
        responseCode,
        backendResponse.msg || $t('request.logoutMsg'),
        response.status,
        backendResponse,
      );
    }

    const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];

    if (modalLogoutCodes.includes(responseCode)) {
      window.$dialog?.error({
        title: $t('request.logoutWithModal'),
        content: backendResponse.msg || $t('request.logoutWithModalMsg'),
        positiveText: $t('common.confirm'),
        maskClosable: false,
        onPositiveClick: () => {
          void handlers.onUnauthorized?.();
        },
      });

      return createError(responseCode, backendResponse.msg, response.status, backendResponse);
    }

    const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];

    if (allowRetry && expiredTokenCodes.includes(responseCode)) {
      const success = await handleExpiredRequest(state, async () => {
        return (await handlers.onTokenExpired?.()) ?? false;
      });

      if (success) {
        return execute<T>(config, false);
      }
    }

    showErrorMsg(state, backendResponse.msg || $t('request.serverError'));

    return createError(
      responseCode,
      backendResponse.msg || $t('request.serverError'),
      response.status,
      backendResponse,
    );
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
