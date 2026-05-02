import { postToWeb, type Logger, type RefObject, type WebViewLike } from "@booklog/bridge";
import type { NativeToWebMessage } from "@booklog/bridge";

/**
 * 현재 마운트된 WebView ref를 모아두는 레지스트리입니다.
 * 인증/테마/폰트 스케일 같은 앱 전역 상태 변경을 모든 활성 WebView에 한 번에 전파할 때 사용합니다.
 * (현재 WebView는 library탭 하나만 실행 됨) [26.5.2]
 */
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
