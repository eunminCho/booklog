"use client";

import {
  BRIDGE_VERSION,
  BootstrapPayloadSchema,
  createConsoleLogger,
  createWebReceiver,
  postToNative,
  type AuthPayload,
} from "@booklog/bridge";
import { useEffect, useState } from "react";

type UseNativeBridgeResult = {
  auth: AuthPayload | null;
  theme: "light" | "dark" | "system";
  fontScale: number;
  requestLogout: () => void;
};

declare global {
  interface Window {
    __BOOKLOG_BOOTSTRAP__?: unknown;
  }
}

const logger = createConsoleLogger("web-bridge");

function readBootstrap() {
  if (typeof window === "undefined") {
    return null;
  }

  const parsed = BootstrapPayloadSchema.safeParse(window.__BOOKLOG_BOOTSTRAP__);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function useNativeBridge(): UseNativeBridgeResult {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [fontScale, setFontScale] = useState<number>(1);

  useEffect(() => {
    const initial = readBootstrap();
    if (initial) {
      setAuth(initial.auth);
      setTheme(initial.theme);
      setFontScale(initial.fontScale);
    }

    const dispose = createWebReceiver({
      logger,
      onMessage: (message) => {
        switch (message.type) {
          case "SET_AUTH":
            setAuth(message.payload);
            return;
          case "CLEAR_AUTH":
            setAuth(null);
            return;
          case "SET_THEME":
            setTheme(message.payload.theme);
            return;
          case "SET_FONT_SCALE":
            setFontScale(message.payload.fontScale);
            return;
          default:
            return;
        }
      },
    });

    postToNative(
      {
        v: BRIDGE_VERSION,
        type: "READY",
        payload: initial ?? {
          auth: null,
          theme: "system",
          fontScale: 1,
          appVersion: "web",
          platform: "ios",
        },
      },
      logger,
    );

    return dispose;
  }, []);

  return {
    auth,
    theme,
    fontScale,
    requestLogout: () => {
      postToNative(
        {
          v: BRIDGE_VERSION,
          type: "REQUEST_LOGOUT",
        },
        logger,
      );
    },
  };
}
