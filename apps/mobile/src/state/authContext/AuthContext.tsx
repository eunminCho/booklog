import { BRIDGE_VERSION, createConsoleLogger } from "@booklog/bridge";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { login, logout, signUp } from "../../lib/auth/api";
import { toSessionState, type SessionState } from "../../lib/auth/session";
import { clearSession, loadSession, saveSession } from "../../lib/auth/storage";
import { postToRegisteredWebViews } from "../../lib/bridge/webviewRegistry";
import { AuthContextValue } from "./type";


/**
 * - 인증 상태를 앱 전역에서 관리 (세션 복원/로그인/로그아웃)
 * - 토큰이 바뀌면 RN, WebView 인증 상태 동기화
 * - 인증 관련 비동기 상태, 에러를 공통으로 사용
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const logger = createConsoleLogger("mobile-auth");

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1) 인증 상태를 관리합니다.
  const [session, setSession] = useState<SessionState | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2) RN -> WebView 인증 상태를 동기화합니다.
  const syncSetAuth = useCallback((nextSession: SessionState): void => {
    postToRegisteredWebViews(
      {
        v: BRIDGE_VERSION,
        type: "SET_AUTH",
        payload: {
          token: nextSession.token,
          userId: nextSession.userId,
        },
      },
      logger,
    );
  }, []);

  const syncClearAuth = useCallback((): void => {
    postToRegisteredWebViews(
      {
        v: BRIDGE_VERSION,
        type: "CLEAR_AUTH",
      },
      logger,
    );
  }, []);

  // 3) 앱 시작 시 세션을 복원합니다.
  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      try {
        const token = await loadSession();
        if (!token) {
          return;
        }

        const restored = toSessionState(token);
        if (!restored) {
          await clearSession();
          return;
        }

        setSession(restored);
      } catch (bootstrapError) {
        logger.warn("failed to restore session", bootstrapError);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  // 4) 인증 액션을 처리합니다.
  const signInHandler = useCallback(async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { token } = await login(email, password);
      await saveSession(token);

      const nextSession = toSessionState(token);
      if (!nextSession) {
        throw new Error("세션 토큰이 올바르지 않습니다.");
      }

      setSession(nextSession);
      syncSetAuth(nextSession);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "로그인에 실패했습니다.";
      setError(message);
      throw caughtError;
    } finally {
      setIsSubmitting(false);
    }
  }, [syncSetAuth]);

  const signUpHandler = useCallback(async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { token } = await signUp(email, password);
      await saveSession(token);

      const nextSession = toSessionState(token);
      if (!nextSession) {
        throw new Error("세션 토큰이 올바르지 않습니다.");
      }

      setSession(nextSession);
      syncSetAuth(nextSession);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "회원가입에 실패했습니다.";
      setError(message);
      throw caughtError;
    } finally {
      setIsSubmitting(false);
    }
  }, [syncSetAuth]);

  const signOutHandler = useCallback(async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    try {
      try {
        await logout();
      } catch (logoutError) {
        logger.warn("logout api failed, continuing local clear", logoutError);
      }

      await clearSession();
      setSession(null);
      syncClearAuth();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "로그아웃에 실패했습니다.";
      setError(message);
      throw caughtError;
    } finally {
      setIsSubmitting(false);
    }
  }, [syncClearAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      session,
      isBootstrapping,
      isSubmitting,
      error,
      signIn: signInHandler,
      signUp: signUpHandler,
      signOut: signOutHandler,
      clearError: () => setError(null),
    }),
    [error, isBootstrapping, isSubmitting, session, signInHandler, signOutHandler, signUpHandler],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
