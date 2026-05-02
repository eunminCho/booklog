export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ColorTokens = {
  surface: {
    canvas: string;
    default: string;
    subtle: string;
    selected: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
  };
  brand: {
    primary: string;
  };
  feedback: {
    error: string;
    warning: string;
    warningSubtle: string;
    success: string;
  };
  overlay: {
    scrim: string;
  };
  progress: {
    track: string;
    fill: string;
  };
};
