import { BRIDGE_VERSION, createConsoleLogger } from "@booklog/bridge";
import * as SecureStore from "expo-secure-store";
import {
  AccessibilityInfo,
  AppState,
  Appearance,
  PixelRatio,
  type ColorSchemeName,
  type AppStateStatus,
} from "react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { postToRegisteredWebViews } from "../lib/bridge/webviewRegistry";

export type DisplayTheme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
type DisplaySource = "system" | "override";

type DisplayContextValue = {
  theme: DisplayTheme;
  resolvedTheme: ResolvedTheme;
  fontScale: number;
  source: DisplaySource;
  setTheme: (theme: DisplayTheme) => Promise<void>;
  setFontScaleOverride: (fontScale: number) => Promise<void>;
  resetToSystem: () => Promise<void>;
};

const THEME_KEY = "booklog.display.theme";
const FONT_SCALE_OVERRIDE_KEY = "booklog.display.fontScale.override";

const MIN_FONT_SCALE = 0.85;
const MAX_FONT_SCALE = 1.5;

const DisplayContext = createContext<DisplayContextValue | undefined>(undefined);
const logger = createConsoleLogger("mobile-display");

function normalizeTheme(colorScheme: ColorSchemeName): ResolvedTheme {
  return colorScheme === "dark" ? "dark" : "light";
}

function clampFontScale(value: number): number {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value));
}

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<DisplayTheme>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    normalizeTheme(Appearance.getColorScheme()),
  );
  const [systemFontScale, setSystemFontScale] = useState<number>(() =>
    clampFontScale(PixelRatio.getFontScale()),
  );
  const [fontScaleOverride, setFontScaleOverrideState] = useState<number | null>(null);

  const refreshSystemTheme = useCallback(() => {
    setSystemTheme(normalizeTheme(Appearance.getColorScheme()));
  }, []);

  const refreshSystemFontScale = useCallback(() => {
    setSystemFontScale(clampFontScale(PixelRatio.getFontScale()));
  }, []);

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      try {
        const [storedTheme, storedFontScale] = await Promise.all([
          SecureStore.getItemAsync(THEME_KEY),
          SecureStore.getItemAsync(FONT_SCALE_OVERRIDE_KEY),
        ]);

        if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
          setThemeState(storedTheme);
        }

        if (storedFontScale) {
          const parsed = Number(storedFontScale);
          if (Number.isFinite(parsed)) {
            setFontScaleOverrideState(clampFontScale(parsed));
          }
        }
      } catch (error) {
        logger.warn("failed to restore display preferences", error);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    const appearanceSubscription = Appearance.addChangeListener(() => {
      refreshSystemTheme();
    });

    const accessibilityInfo = AccessibilityInfo as unknown as {
      addEventListener?: (eventName: string, listener: () => void) => { remove: () => void };
    };
    const accessibilitySubscription = accessibilityInfo.addEventListener?.(
      "change",
      refreshSystemFontScale,
    );

    const appStateSubscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        refreshSystemTheme();
        refreshSystemFontScale();
      }
    });

    return () => {
      appearanceSubscription.remove();
      accessibilitySubscription?.remove();
      appStateSubscription.remove();
    };
  }, [refreshSystemFontScale, refreshSystemTheme]);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const fontScale = fontScaleOverride ?? systemFontScale;
  const source: DisplaySource = fontScaleOverride === null ? "system" : "override";

  useEffect(() => {
    postToRegisteredWebViews(
      {
        v: BRIDGE_VERSION,
        type: "SET_THEME",
        payload: { theme: resolvedTheme },
      },
      logger,
    );
    postToRegisteredWebViews(
      {
        v: BRIDGE_VERSION,
        type: "SET_FONT_SCALE",
        payload: { fontScale },
      },
      logger,
    );
  }, [fontScale, resolvedTheme]);

  const setTheme = useCallback(async (nextTheme: DisplayTheme): Promise<void> => {
    setThemeState(nextTheme);
    await SecureStore.setItemAsync(THEME_KEY, nextTheme);
  }, []);

  const setFontScaleOverride = useCallback(async (nextFontScale: number): Promise<void> => {
    const clamped = clampFontScale(nextFontScale);
    setFontScaleOverrideState(clamped);
    await SecureStore.setItemAsync(FONT_SCALE_OVERRIDE_KEY, String(clamped));
  }, []);

  const resetToSystem = useCallback(async (): Promise<void> => {
    setThemeState("system");
    setFontScaleOverrideState(null);
    await Promise.all([
      SecureStore.deleteItemAsync(THEME_KEY),
      SecureStore.deleteItemAsync(FONT_SCALE_OVERRIDE_KEY),
    ]);
  }, []);

  const value = useMemo<DisplayContextValue>(
    () => ({
      theme,
      resolvedTheme,
      fontScale,
      source,
      setTheme,
      setFontScaleOverride,
      resetToSystem,
    }),
    [fontScale, resolvedTheme, resetToSystem, setFontScaleOverride, setTheme, source, theme],
  );

  return <DisplayContext.Provider value={value}>{children}</DisplayContext.Provider>;
}

export function useDisplay() {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error("useDisplay must be used within DisplayProvider");
  }

  return context;
}
