import { BRIDGE_VERSION, createConsoleLogger } from "@booklog/bridge";
import {
  AccessibilityInfo,
  AppState,
  Appearance,
  PixelRatio,
  type ColorSchemeName,
  type AppStateStatus,
} from "react-native";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { postToRegisteredWebViews } from "../../lib/bridge/webviewRegistry";
import {
  deleteMMKVItem,
  getMMKVNumber,
  getMMKVString,
  MMKV_KEYS,
  setMMKVNumber,
  setMMKVString,
} from "../../lib/storage/mmkv";
import {
  DisplayContextValue,
  DisplaySource,
  DisplayTheme,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
  ResolvedTheme,
} from "./constants";


/**
 * 앱의 display 설정(테마/폰트 스케일)을 전역으로 관리하는 컨텍스트입니다.
 * - 시스템 설정과 사용자 오버라이드를 함께 다루고, 저장된 설정을 복원합니다.
 * - 값이 바뀌면 WebView에도 동일한 표시 상태를 즉시 동기화합니다.
 */
export const DisplayContext = createContext<DisplayContextValue | undefined>(undefined);
const logger = createConsoleLogger("mobile-display");

function normalizeTheme(colorScheme: ColorSchemeName): ResolvedTheme {
  return colorScheme === "dark" ? "dark" : "light";
}

function clampFontScale(value: number): number {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value));
}

function isDisplayTheme(value: string | null): value is DisplayTheme {
  return value === "light" || value === "dark" || value === "system";
}

function subscribeFontScaleChange(listener: () => void): { remove: () => void } | undefined {
  const accessibilityInfo = AccessibilityInfo as unknown as {
    addEventListener?: (eventName: string, callback: () => void) => { remove: () => void };
  };
  return accessibilityInfo.addEventListener?.("change", listener);
}

export function DisplayProvider({ children }: { children: ReactNode }) {
  // 1) 표시 상태 기본값을 초기화합니다.
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

  // 2) 저장된 사용자 설정을 복원합니다.
  useEffect(() => {
    try {
      const storedTheme = getMMKVString(MMKV_KEYS.DISPLAY_THEME);
      const storedFontScale = getMMKVNumber(MMKV_KEYS.DISPLAY_FONT_SCALE_OVERRIDE);
      const normalizedStoredTheme = storedTheme ?? null;

      if (isDisplayTheme(normalizedStoredTheme)) {
        setThemeState(normalizedStoredTheme);
      }

      if (typeof storedFontScale === "number" && Number.isFinite(storedFontScale)) {
        setFontScaleOverrideState(clampFontScale(storedFontScale));
      }
    } catch (error) {
      logger.warn("failed to restore display preferences", error);
    }
  }, []);

  // 3) 시스템 설정 변화를 감지합니다.
  useEffect(() => {
    const appearanceSubscription = Appearance.addChangeListener(refreshSystemTheme);
    const accessibilitySubscription = subscribeFontScaleChange(refreshSystemFontScale);

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

  // 4) RN -> WebView 표시 상태를 동기화합니다.
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

  // 5) 사용자 액션 핸들러를 제공합니다.
  const setTheme = useCallback(async (nextTheme: DisplayTheme): Promise<void> => {
    setThemeState(nextTheme);
    setMMKVString(MMKV_KEYS.DISPLAY_THEME, nextTheme);
  }, []);

  const setFontScaleOverride = useCallback(async (nextFontScale: number): Promise<void> => {
    const clamped = clampFontScale(nextFontScale);
    setFontScaleOverrideState(clamped);
    setMMKVNumber(MMKV_KEYS.DISPLAY_FONT_SCALE_OVERRIDE, clamped);
  }, []);

  const resetToSystem = useCallback(async (): Promise<void> => {
    setThemeState("system");
    setFontScaleOverrideState(null);
    deleteMMKVItem(MMKV_KEYS.DISPLAY_THEME);
    deleteMMKVItem(MMKV_KEYS.DISPLAY_FONT_SCALE_OVERRIDE);
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
