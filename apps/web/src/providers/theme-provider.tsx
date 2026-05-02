"use client";

import { getColorTokens } from "@booklog/design-tokens";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  fontScale: number;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  setFontScale: (fontScale: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "dark") {
    return "dark";
  }
  if (theme === "light") {
    return "light";
  }
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyDisplayToHtml(theme: Theme, fontScale: number): void {
  const html = document.documentElement;
  const resolvedTheme = resolveTheme(theme);
  const colors = getColorTokens(resolvedTheme);
  html.dataset.theme = theme;
  html.classList.toggle("dark", resolvedTheme === "dark");
  html.style.setProperty("--app-font-scale", String(fontScale));
  html.style.setProperty("--background", colors.surface.canvas);
  html.style.setProperty("--foreground", colors.text.primary);
  html.style.setProperty("--surface-default", colors.surface.default);
  html.style.setProperty("--surface-subtle", colors.surface.subtle);
  html.style.setProperty("--surface-selected", colors.surface.selected);
  html.style.setProperty("--text-secondary", colors.text.secondary);
  html.style.setProperty("--text-muted", colors.text.muted);
  html.style.setProperty("--text-inverse", colors.text.inverse);
  html.style.setProperty("--border-default", colors.border.default);
  html.style.setProperty("--border-subtle", colors.border.subtle);
  html.style.setProperty("--border-strong", colors.border.strong);
  html.style.setProperty("--feedback-error", colors.feedback.error);
}

export function ThemeProvider({
  children,
  initialTheme,
  initialFontScale,
}: {
  children: ReactNode;
  initialTheme: Theme;
  initialFontScale: number;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [fontScale, setFontScale] = useState<number>(initialFontScale);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(initialTheme));
  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);
  useEffect(() => {
    setFontScale(initialFontScale);
  }, [initialFontScale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    applyDisplayToHtml(theme, fontScale);
    setResolvedTheme(resolveTheme(theme));
  }, [fontScale, theme]);

  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyDisplayToHtml(theme, fontScale);
      setResolvedTheme(resolveTheme(theme));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [fontScale, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, fontScale, resolvedTheme, setTheme, setFontScale }),
    [fontScale, resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeState() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeState must be used within ThemeProvider");
  }

  return context;
}
