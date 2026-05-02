import type { ColorTokens, ResolvedTheme } from "../types";

const lightColors: ColorTokens = {
  surface: {
    canvas: "#ffffff",
    default: "#ffffff",
    subtle: "#f3f4f6",
    selected: "#f3f4f6",
    inverse: "#111827",
  },
  text: {
    primary: "#111827",
    secondary: "#374151",
    muted: "#6b7280",
    inverse: "#f9fafb",
  },
  border: {
    default: "#6b7280",
    subtle: "#d4d4d8",
    strong: "#3f3f46",
  },
  brand: {
    primary: "#111827",
  },
  feedback: {
    error: "#b91c1c",
    warning: "#d97706",
    warningSubtle: "rgba(254, 240, 138, 0.25)",
    success: "#15803d",
  },
  overlay: {
    scrim: "rgba(0, 0, 0, 0.55)",
  },
  progress: {
    track: "rgba(17, 24, 39, 0.12)",
    fill: "#111827",
  },
};

const darkColors: ColorTokens = {
  surface: {
    canvas: "#030712",
    default: "#111827",
    subtle: "#1f2937",
    selected: "#111827",
    inverse: "#f3f4f6",
  },
  text: {
    primary: "#f9fafb",
    secondary: "#d1d5db",
    muted: "#9ca3af",
    inverse: "#111827",
  },
  border: {
    default: "#6b7280",
    subtle: "#3f3f46",
    strong: "#9ca3af",
  },
  brand: {
    primary: "#e5e7eb",
  },
  feedback: {
    error: "#fecaca",
    warning: "#fde68a",
    warningSubtle: "rgba(254, 240, 138, 0.25)",
    success: "#86efac",
  },
  overlay: {
    scrim: "rgba(0, 0, 0, 0.55)",
  },
  progress: {
    track: "rgba(17, 24, 39, 0.12)",
    fill: "#111827",
  },
};

export const colorTokensByTheme: Record<ResolvedTheme, ColorTokens> = {
  light: lightColors,
  dark: darkColors,
};
