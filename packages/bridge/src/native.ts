import { NativeToWebMessageSchema, WebToNativeMessageSchema } from "./schema";
import type { NativeToWebMessage, WebToNativeMessage } from "./schema";
import { createNoopLogger } from "./logger";
import type { Logger } from "./logger";

export interface RefObject<T> {
  current: T | null;
}

export interface WebViewLike {
  injectJavaScript(script: string): void;
}

export function postToWeb(
  webViewRef: RefObject<WebViewLike>,
  msg: NativeToWebMessage,
  logger: Logger = createNoopLogger(),
): void {
  const validated = NativeToWebMessageSchema.safeParse(msg);
  if (!validated.success) {
    logger.warn("postToWeb ignored invalid NativeToWebMessage", validated.error);
    return;
  }

  const webView = webViewRef.current;
  if (!webView) {
    logger.debug("postToWeb skipped because webViewRef.current is null");
    return;
  }

  const raw = JSON.stringify(validated.data);
  const rawLiteral = JSON.stringify(raw);
  const script = `window.__BOOKLOG_RECEIVE__?.(${rawLiteral});true;`;
  webView.injectJavaScript(script);
}

export interface NativeMessageEvent {
  nativeEvent?: {
    data?: string;
  };
}

export function createNativeReceiver(options: {
  onMessage: (msg: WebToNativeMessage) => void;
  logger?: Logger;
}): (event: NativeMessageEvent) => void {
  const logger = options.logger ?? createNoopLogger();

  return (event: NativeMessageEvent): void => {
    const raw = event.nativeEvent?.data;
    if (typeof raw !== "string") {
      logger.warn("createNativeReceiver ignored non-string data", raw);
      return;
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch (error) {
      logger.warn("createNativeReceiver failed to parse JSON", error);
      return;
    }

    const validated = WebToNativeMessageSchema.safeParse(parsedJson);
    if (!validated.success) {
      logger.warn("createNativeReceiver ignored schema-mismatched message", validated.error);
      return;
    }

    options.onMessage(validated.data);
  };
}
