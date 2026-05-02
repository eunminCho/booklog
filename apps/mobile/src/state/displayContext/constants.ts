export type DisplayTheme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type DisplaySource = "system" | "override";

export type DisplayContextValue = {
  theme: DisplayTheme;
  resolvedTheme: ResolvedTheme;
  fontScale: number;
  source: DisplaySource;
  setTheme: (theme: DisplayTheme) => Promise<void>;
  setFontScaleOverride: (fontScale: number) => Promise<void>;
  resetToSystem: () => Promise<void>;
};

export const THEME_KEY = "booklog.display.theme";
export const FONT_SCALE_OVERRIDE_KEY = "booklog.display.fontScale.override";

export const MIN_FONT_SCALE = 0.85;
export const MAX_FONT_SCALE = 1.5;
