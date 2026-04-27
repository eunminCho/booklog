import {
  BRIDGE_VERSION,
  buildBootstrapScript,
  createConsoleLogger,
  createNativeReceiver,
  postToWeb,
  type NativeToWebMessage,
  type WebToNativeMessage,
} from "@booklog/bridge";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import Constants from "expo-constants";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Linking, Platform } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { getApiBaseUrl } from "../lib/config";
import { registerWebViewRef } from "../lib/bridge/webviewRegistry";
import { useAuth } from "../state/AuthContext";

const logger = createConsoleLogger("app-webview");

export type AppWebViewHandle = {
  postToWeb: (message: NativeToWebMessage) => void;
};

type AppWebViewProps = {
  path: string;
};

function toReadyStateMessage(token: string | null, userId: string | null): NativeToWebMessage[] {
  const baseMessages: NativeToWebMessage[] = [
    {
      v: BRIDGE_VERSION,
      type: "SET_THEME",
      payload: { theme: "system" },
    },
  ];

  if (token && userId) {
    return [
      {
        v: BRIDGE_VERSION,
        type: "SET_AUTH",
        payload: { token, userId },
      },
      ...baseMessages,
    ];
  }

  return [{ v: BRIDGE_VERSION, type: "CLEAR_AUTH" }, ...baseMessages];
}

export const AppWebView = forwardRef<AppWebViewHandle, AppWebViewProps>(function AppWebView(
  { path },
  ref,
) {
  const { session, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const webViewRef = useRef<WebView | null>(null);
  const apiBaseUrl = getApiBaseUrl();

  const bootstrapScript = useMemo(() => {
    return buildBootstrapScript({
      auth: session
        ? {
            token: session.token,
            userId: session.userId,
          }
        : null,
      theme: "system",
      fontScale: 1,
      appVersion: Constants.expoConfig?.version ?? "1.0.0",
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
  }, [session]);

  const dispatchFromWeb = useCallback(async (message: WebToNativeMessage): Promise<void> => {
    switch (message.type) {
      case "READY": {
        const syncMessages = toReadyStateMessage(session?.token ?? null, session?.userId ?? null);
        syncMessages.forEach((item) => {
          postToWeb(webViewRef, item, logger);
        });
        return;
      }
      case "REQUEST_LOGOUT": {
        await signOut();
        return;
      }
      case "OPEN_NATIVE_SCREEN": {
        if (message.payload.screen === "Scan" || message.payload.screen === "Settings") {
          navigation.navigate(message.payload.screen);
        }
        return;
      }
      case "OPEN_EXTERNAL": {
        await Linking.openURL(message.payload.url);
        return;
      }
      default:
        return;
    }
  }, [navigation, session?.token, session?.userId, signOut]);

  const handleMessage = useMemo(
    () =>
      createNativeReceiver({
        onMessage: (message) => {
          void dispatchFromWeb(message);
        },
        logger,
      }),
    [dispatchFromWeb],
  );

  useEffect(() => {
    return registerWebViewRef(webViewRef);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      postToWeb: (message: NativeToWebMessage) => {
        postToWeb(webViewRef, message, logger);
      },
    }),
    [],
  );

  const originWhitelist = useMemo(
    () => [apiBaseUrl, "http://*", "https://*"],
    [apiBaseUrl],
  );

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: `${apiBaseUrl}${path}` }}
      originWhitelist={originWhitelist}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      injectedJavaScriptBeforeContentLoaded={bootstrapScript}
      onMessage={handleMessage as (event: WebViewMessageEvent) => void}
    />
  );
});
