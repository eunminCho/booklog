import { describe, expect, it, vi } from "vitest";
import { createNativeReceiver, postToWeb, type WebViewLike } from "./native";
import { BRIDGE_VERSION } from "./schema";
import type { Logger } from "./logger";

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("postToWeb", () => {
  it("calls injectJavaScript with serialized payload", () => {
    const injectJavaScript = vi.fn<WebViewLike["injectJavaScript"]>();
    const webViewRef = { current: { injectJavaScript } };
    const logger = createMockLogger();
    const msg = { v: BRIDGE_VERSION, type: "CLEAR_AUTH" } as const;

    postToWeb(webViewRef, msg, logger);

    expect(injectJavaScript).toHaveBeenCalledTimes(1);
    expect(injectJavaScript).toHaveBeenCalledWith(
      `window.__BOOKLOG_RECEIVE__?.(${JSON.stringify(JSON.stringify(msg))});true;`,
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("does not call injectJavaScript for invalid message and warns", () => {
    const injectJavaScript = vi.fn<WebViewLike["injectJavaScript"]>();
    const webViewRef = { current: { injectJavaScript } };
    const logger = createMockLogger();
    const invalid = { v: BRIDGE_VERSION, type: "SET_AUTH" } as unknown as Parameters<typeof postToWeb>[1];

    postToWeb(webViewRef, invalid, logger);

    expect(injectJavaScript).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});

describe("createNativeReceiver", () => {
  it("handles invalid JSON, schema mismatch, and valid message", () => {
    const logger = createMockLogger();
    const onMessage = vi.fn();
    const receiver = createNativeReceiver({ onMessage, logger });

    receiver({ nativeEvent: { data: "not-json" } });
    receiver({ nativeEvent: { data: JSON.stringify({ v: BRIDGE_VERSION, type: "READY" }) } });
    receiver({
      nativeEvent: {
        data: JSON.stringify({
          v: BRIDGE_VERSION,
          type: "REQUEST_LOGOUT",
        }),
      },
    });

    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({ v: BRIDGE_VERSION, type: "REQUEST_LOGOUT" });
  });
});
