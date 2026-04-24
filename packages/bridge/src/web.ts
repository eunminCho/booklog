import { NativeToWebMessageSchema, WebToNativeMessageSchema } from "./schema";
import type { NativeToWebMessage, WebToNativeMessage } from "./schema";
import { createNoopLogger } from "./logger";
import type { Logger } from "./logger";

declare global {
  interface Window {
    __BOOKLOG_RECEIVE__?: (raw: unknown) => void;
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

export function postToNative(
  msg: WebToNativeMessage,
  logger: Logger = createNoopLogger(),
): void {
  if (typeof window === "undefined") {
    logger.debug("postToNative skipped because window is unavailable");
    return;
  }

  const validated = WebToNativeMessageSchema.safeParse(msg);
  if (!validated.success) {
    logger.warn("postToNative ignored invalid WebToNativeMessage", validated.error);
    return;
  }

  const bridge = window.ReactNativeWebView;
  if (!bridge) {
    logger.debug("postToNative no-op because ReactNativeWebView is unavailable");
    return;
  }

  bridge.postMessage(JSON.stringify(validated.data));
}

export function createWebReceiver(options: {
  onMessage: (msg: NativeToWebMessage) => void;
  logger?: Logger;
}): () => void {
  if (typeof window === "undefined") {
    const logger = options.logger ?? createNoopLogger();
    logger.debug("createWebReceiver skipped because window is unavailable");
    return () => {};
  }

  const logger = options.logger ?? createNoopLogger();
  const previousReceiver = window.__BOOKLOG_RECEIVE__;

  const receiver = (raw: unknown): void => {
    let parsedJson: unknown = raw;
    if (typeof raw === "string") {
      try {
        parsedJson = JSON.parse(raw);
      } catch (error) {
        logger.warn("createWebReceiver failed to parse JSON", error);
        return;
      }
    }

    const validated = NativeToWebMessageSchema.safeParse(parsedJson);
    if (!validated.success) {
      logger.warn("createWebReceiver ignored schema-mismatched message", validated.error);
      return;
    }

    options.onMessage(validated.data);
  };

  window.__BOOKLOG_RECEIVE__ = receiver;

  return (): void => {
    if (window.__BOOKLOG_RECEIVE__ === receiver) {
      window.__BOOKLOG_RECEIVE__ = previousReceiver;
    }
  };
}
