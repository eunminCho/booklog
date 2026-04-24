import { afterEach, describe, expect, it, vi } from "vitest";
import { createWebReceiver, postToNative } from "./web";
import { BRIDGE_VERSION } from "./schema";
import type { Logger } from "./logger";

type WindowMock = Window & {
  ReactNativeWebView?: {
    postMessage(message: string): void;
  };
  __BOOKLOG_RECEIVE__?: (raw: unknown) => void;
};

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function installWindowMock(): WindowMock {
  const windowMock = {
    ReactNativeWebView: {
      postMessage: vi.fn(),
    },
  } as unknown as WindowMock;
  vi.stubGlobal("window", windowMock);
  return windowMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("window bridge mock lifecycle", () => {
  it("installs and removes ReactNativeWebView mock on global", () => {
    installWindowMock();
    expect(window.ReactNativeWebView).toBeDefined();

    vi.unstubAllGlobals();
    expect(globalThis).not.toHaveProperty("window");
  });
});

describe("postToNative", () => {
  it("sends valid message to ReactNativeWebView", () => {
    const windowMock = installWindowMock();
    const logger = createMockLogger();
    const msg = { v: BRIDGE_VERSION, type: "REQUEST_LOGOUT" } as const;

    postToNative(msg, logger);

    expect(windowMock.ReactNativeWebView?.postMessage).toHaveBeenCalledTimes(1);
    expect(windowMock.ReactNativeWebView?.postMessage).toHaveBeenCalledWith(JSON.stringify(msg));
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("warns and does not send invalid message", () => {
    const windowMock = installWindowMock();
    const logger = createMockLogger();
    const invalid = { v: BRIDGE_VERSION, type: "OPEN_EXTERNAL" } as unknown as Parameters<typeof postToNative>[0];

    postToNative(invalid, logger);

    expect(windowMock.ReactNativeWebView?.postMessage).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});

describe("createWebReceiver", () => {
  it("handles incoming call and stops after cleanup", () => {
    const windowMock = installWindowMock();
    const logger = createMockLogger();
    const onMessage = vi.fn();
    const dispose = createWebReceiver({ onMessage, logger });

    windowMock.__BOOKLOG_RECEIVE__?.(
      JSON.stringify({
        v: BRIDGE_VERSION,
        type: "CLEAR_AUTH",
      }),
    );
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({ v: BRIDGE_VERSION, type: "CLEAR_AUTH" });

    dispose();
    onMessage.mockClear();
    windowMock.__BOOKLOG_RECEIVE__?.(
      JSON.stringify({
        v: BRIDGE_VERSION,
        type: "CLEAR_AUTH",
      }),
    );
    expect(onMessage).not.toHaveBeenCalled();
  });
});
