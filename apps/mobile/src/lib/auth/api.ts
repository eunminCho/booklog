import { buildWebUrl } from "../config";

const SESSION_COOKIE_NAME = "bl_session";

type AuthUser = {
  id: string;
  email: string;
};

type AuthSuccessResponse = {
  ok: true;
  user: AuthUser;
};

type ErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class AuthApiError extends Error {
  readonly status: number | null;
  readonly code: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "AuthApiError";
    this.status = options?.status ?? null;
    this.code = options?.code ?? "AUTH_API_ERROR";
  }
}

export type AuthResult = {
  token: string;
  user: AuthUser;
};

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function parseSessionTokenFromSetCookie(setCookie: string | null): string | null {
  if (!setCookie) {
    return null;
  }

  const regex = new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`);
  const match = setCookie.match(regex);
  if (!match || !match[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

async function requestAuth(
  endpoint: "/api/auth/login" | "/api/auth/signup",
  email: string,
  password: string,
): Promise<AuthResult> {
  let response: Response;
  try {
    response = await fetch(buildWebUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthApiError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.", {
      code: "NETWORK_ERROR",
    });
  }

  if (!response.ok) {
    const data = await parseJson<ErrorResponse>(response);
    throw new AuthApiError(data?.error?.message ?? "인증 요청을 처리하지 못했습니다.", {
      status: response.status,
      code: data?.error?.code,
    });
  }

  const data = await parseJson<AuthSuccessResponse>(response);
  if (!data?.user?.id || !data.user.email) {
    throw new AuthApiError("서버 응답 형식이 올바르지 않습니다.", {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  const token = parseSessionTokenFromSetCookie(response.headers.get("set-cookie"));
  if (!token) {
    throw new AuthApiError("세션 쿠키를 찾지 못했습니다.", {
      status: response.status,
      code: "MISSING_SESSION_COOKIE",
    });
  }

  return {
    token,
    user: data.user,
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  return requestAuth("/api/auth/login", email, password);
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  return requestAuth("/api/auth/signup", email, password);
}

export async function logout(): Promise<void> {
  let response: Response;
  try {
    response = await fetch(buildWebUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } catch {
    throw new AuthApiError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.", {
      code: "NETWORK_ERROR",
    });
  }

  if (!response.ok) {
    const data = await parseJson<ErrorResponse>(response);
    throw new AuthApiError(data?.error?.message ?? "로그아웃에 실패했습니다.", {
      status: response.status,
      code: data?.error?.code,
    });
  }
}
