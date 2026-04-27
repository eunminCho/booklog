"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { AuthPayload } from "@booklog/bridge";

type AuthContextValue = {
  auth: AuthPayload | null;
  setAuth: (auth: AuthPayload | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialAuth,
}: {
  children: ReactNode;
  initialAuth: AuthPayload | null;
}) {
  const [auth, setAuth] = useState<AuthPayload | null>(initialAuth);
  useEffect(() => {
    setAuth(initialAuth);
  }, [initialAuth]);

  const value = useMemo<AuthContextValue>(() => ({ auth, setAuth }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }

  return context;
}
