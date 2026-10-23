import { localStg } from '@/utils/storage';

interface MockUser extends Api.Auth.UserInfo {
  password: string;
}

const users: MockUser[] = [
  {
    userId: '1',
    userName: 'Admin',
    password: '123456',
    roles: ['R_SUPER', 'R_ADMIN'],
    buttons: ['*'],
  },
  {
    userId: '2',
    userName: 'Soybean',
    password: '123456',
    roles: ['R_ADMIN'],
    buttons: [
      'system:menu:view',
      'system:menu:add',
      'system:menu:edit',
      'system:user:view',
      'system:user:add',
      'system:user:edit',
    ],
  },
  {
    userId: '3',
    userName: 'User',
    password: '123456',
    roles: ['R_USER'],
    buttons: ['system:menu:view'],
  },
];

const userPhones: Record<string, string> = {
  '1': '13800000001',
  '2': '13800000002',
  '3': '13800000003',
};

const MOCK_CAPTCHA_CODE = '123456';
const CAPTCHA_TTL = 5 * 60 * 1000;

const captchaCodes = new Map<string, { code: string; expiresAt: number }>();

function createSuccess<T>(data: T): App.Service.FlatResponseData<T> {
  return { data, error: null };
}

function createFailure(code: string, message: string): App.Service.FlatResponseData<never> {
  return {
    data: null,
    error: {
      code,
      message,
    },
  };
}

function createToken(user: MockUser): Api.Auth.LoginToken {
  return {
    token: `mock-token:${user.userId}`,
    refreshToken: `mock-refresh:${user.userId}`,
  };
}

function toUserInfo(user: MockUser): Api.Auth.UserInfo {
  const { password: _password, ...userInfo } = user;

  return userInfo;
}

function getUserByPhone(phone: string) {
  const entry = Object.entries(userPhones).find(([, value]) => value === phone);

  return entry ? (users.find((user) => user.userId === entry[0]) ?? null) : null;
}

/** Resolve the signed-in mock user from a token */
export function getMockUserByToken(token: string | null) {
  if (!token?.startsWith('mock-token:')) {
    return null;
  }

  const userId = token.split(':', 2)[1];

  return users.find((user) => user.userId === userId) ?? null;
}

function handleLogin(config: App.Service.RequestConfig) {
  const { userName, password } = (config.data || {}) as { userName?: string; password?: string };

  const user = users.find((item) => item.userName.toLowerCase() === String(userName).toLowerCase());

  if (!user || user.password !== password) {
    return createFailure('1001', 'Invalid user name or password');
  }

  return createSuccess(createToken(user));
}

function handleSendCaptcha(config: App.Service.RequestConfig) {
  const { phone } = (config.data || {}) as { phone?: string };
  const user = getUserByPhone(String(phone || ''));

  if (!user) {
    return createFailure('1002', 'This phone number is not registered');
  }

  captchaCodes.set(String(phone), {
    code: MOCK_CAPTCHA_CODE,
    expiresAt: Date.now() + CAPTCHA_TTL,
  });

  return createSuccess({ sent: true } satisfies Api.Auth.CaptchaResult);
}

function handleCodeLogin(config: App.Service.RequestConfig) {
  const { phone, code } = (config.data || {}) as { phone?: string; code?: string };
  const user = getUserByPhone(String(phone || ''));
  const captcha = captchaCodes.get(String(phone || ''));

  if (!user) {
    return createFailure('1002', 'This phone number is not registered');
  }

  if (!captcha || captcha.code !== code || captcha.expiresAt < Date.now()) {
    return createFailure('1003', 'The verification code is invalid or expired');
  }

  captchaCodes.delete(String(phone));

  return createSuccess(createToken(user));
}

function handleResetPassword(config: App.Service.RequestConfig) {
  const { account } = (config.data || {}) as { account?: string };
  const normalizedAccount = String(account || '').trim();
  const user =
    users.find((item) => item.userName.toLowerCase() === normalizedAccount.toLowerCase()) ??
    getUserByPhone(normalizedAccount);

  if (!user) {
    return createFailure('1004', 'Account not found');
  }

  return createSuccess({ sent: true } satisfies Api.Auth.ResetPasswordResult);
}

function handleGetUserInfo() {
  const user = getMockUserByToken(localStg.get('token'));

  if (!user) {
    return createFailure('8888', 'The login status has expired');
  }

  return createSuccess(toUserInfo(user));
}

function handleRefreshToken(config: App.Service.RequestConfig) {
  const { refreshToken } = (config.data || {}) as { refreshToken?: string };
  const userId = String(refreshToken).split(':', 2)[1];
  const user = users.find((item) => item.userId === userId);

  if (!user) {
    return createFailure('8888', 'The refresh token has expired');
  }

  return createSuccess(createToken(user));
}

function handleAuthError(config: App.Service.RequestConfig) {
  return createFailure(
    String(config.params?.code || '9999'),
    String(config.params?.msg || 'Mock backend error'),
  );
}

type AuthHandler = (config: App.Service.RequestConfig) => App.Service.FlatResponseData<unknown>;

const authHandlers: Record<string, AuthHandler> = {
  'POST /auth/login': handleLogin,
  'POST /auth/sendCaptcha': handleSendCaptcha,
  'POST /auth/codeLogin': handleCodeLogin,
  'POST /auth/resetPassword': handleResetPassword,
  'GET /auth/getUserInfo': handleGetUserInfo,
  'POST /auth/refreshToken': handleRefreshToken,
  'GET /auth/error': handleAuthError,
};

/** The mock auth endpoints */
export function handleAuthMockRequest(
  config: App.Service.RequestConfig,
): App.Service.FlatResponseData<unknown> | null {
  const key = `${config.method || 'GET'} ${config.url}`;

  return authHandlers[key]?.(config) ?? null;
}
