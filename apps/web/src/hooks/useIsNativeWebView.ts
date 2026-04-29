"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __BOOKLOG_BOOTSTRAP__?: unknown;
  }
}

export function useIsNativeWebView(): boolean | null {
  const [isNativeWebView, setIsNativeWebView] = useState<boolean | null>(null);

  useEffect(() => {
    setIsNativeWebView(
      typeof window.__BOOKLOG_BOOTSTRAP__ === "object" && window.__BOOKLOG_BOOTSTRAP__ !== null,
    );
  }, []);

  return isNativeWebView;
}
