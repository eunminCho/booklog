"use client";

import type { ReactNode } from "react";

import { useNativeBridge } from "@/src/hooks/useNativeBridge";
import { AuthProvider } from "@/src/providers/auth-provider";
import { ThemeProvider } from "@/src/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const { auth, theme, fontScale } = useNativeBridge();

  return (
    <AuthProvider initialAuth={auth}>
      <ThemeProvider initialTheme={theme} initialFontScale={fontScale}>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
