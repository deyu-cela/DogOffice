export type Credentials = {
  account: string;
  password: string;
};

export type TokenPair = {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_expires_at: string;
};

export type AuthUser = {
  userId: number;
  account: string;
};

export type StoredAuth = TokenPair & {
  user: AuthUser;
};

export type AuthStatus =
  | 'idle'
  | 'bootstrapping'
  | 'authenticating'
  | 'authed';

export type AuthErrorField = 'account' | 'password' | null;

export type AuthError = {
  message: string;
  field: AuthErrorField;
};

export type LoginResponse = TokenPair;

export type RefreshResponse = TokenPair;

export type RegisterResponse = {
  user_id: number;
  account: string;
};

export type MeResponse = {
  user_id: number;
  account: string;
};

export type CommonResponseBody<T = unknown> = {
  code: number;
  message: string;
  data: T;
};
