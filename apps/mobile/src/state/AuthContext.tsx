import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AuthContextValue = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      setToken: (nextToken: string) => setTokenState(nextToken),
      clearToken: () => setTokenState(null),
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
