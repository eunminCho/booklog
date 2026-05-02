import { SessionState } from "../../lib/auth/session";

export type AuthContextValue = {
    token: string | null;
    session: SessionState | null;
    isBootstrapping: boolean;
    isSubmitting: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
  };