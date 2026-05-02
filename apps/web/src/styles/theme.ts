import { getColorTokens, type ColorTokens, type ResolvedTheme } from "@booklog/design-tokens";

export type AppTheme = {
  mode: ResolvedTheme;
  colors: ColorTokens;
  fontScale: number;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    body: number;
    sm: number;
    xs: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
};

export function createAppTheme(mode: ResolvedTheme, fontScale: number): AppTheme {
  return {
    mode,
    colors: getColorTokens(mode),
    fontScale,
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    },
    radius: {
      sm: 6,
      md: 8,
      lg: 12,
      full: 999,
    },
    typography: {
      xs: 12,
      sm: 14,
      body: 16,
      lg: 18,
      xl: 24,
      xxl: 30,
    },
    shadow: {
      sm: "0 1px 2px rgba(15, 23, 42, 0.08)",
      md: "0 4px 10px rgba(15, 23, 42, 0.08)",
      lg: "0 10px 24px rgba(15, 23, 42, 0.14)",
    },
  };
}
