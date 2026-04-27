import { postToWeb, type Logger, type RefObject, type WebViewLike } from "@booklog/bridge";
import type { NativeToWebMessage } from "@booklog/bridge";

const webViewRefs = new Set<RefObject<WebViewLike>>();

export function registerWebViewRef(ref: RefObject<WebViewLike>): () => void {
  webViewRefs.add(ref);
  return () => {
    webViewRefs.delete(ref);
  };
}

export function postToRegisteredWebViews(message: NativeToWebMessage, logger: Logger): void {
  webViewRefs.forEach((ref) => {
    postToWeb(ref, message, logger);
  });
}
