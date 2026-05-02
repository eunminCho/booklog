"use client";

import { Global, ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { createAppTheme } from "@/src/styles/theme";

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

function resolveTheme(theme: Theme, allowSystemMedia = false): ResolvedTheme {
  if (theme === "dark") {
    return "dark";
  }
  if (theme === "light") {
    return "light";
  }
  if (!allowSystemMedia || typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyDisplayToHtml(theme: Theme, fontScale: number): void {
  const html = document.documentElement;
  const resolvedTheme = resolveTheme(theme, true);
  html.dataset.theme = theme;
  html.style.colorScheme = resolvedTheme;
  html.style.setProperty("--app-font-scale", String(fontScale));
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
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(initialTheme, false));
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
    setResolvedTheme(resolveTheme(theme, true));
  }, [fontScale, theme]);

  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyDisplayToHtml(theme, fontScale);
      setResolvedTheme(resolveTheme(theme, true));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [fontScale, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, fontScale, resolvedTheme, setTheme, setFontScale }),
    [fontScale, resolvedTheme, theme],
  );
  const emotionTheme = useMemo(() => createAppTheme(resolvedTheme, fontScale), [fontScale, resolvedTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <EmotionThemeProvider theme={emotionTheme}>
        <Global
          styles={{
            "*": { boxSizing: "border-box" },
            "*::before": { boxSizing: "border-box" },
            "*::after": { boxSizing: "border-box" },
            html: {
              minHeight: "100%",
              margin: 0,
              padding: 0,
              fontSize: "calc(16px * var(--app-font-scale))",
            },
            body: {
              minHeight: "100%",
              margin: 0,
              padding: 0,
              backgroundColor: emotionTheme.colors.surface.canvas,
              color: emotionTheme.colors.text.primary,
              fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
              fontSize: "1rem",
              lineHeight: 1.45,
            },
            a: {
              color: "inherit",
              textDecoration: "none",
            },
          }}
        />
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeState() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeState must be used within ThemeProvider");
  }

  return context;
}
