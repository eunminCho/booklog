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
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { getApiBaseUrl } from "../lib/config";
import { registerWebViewRef } from "../lib/bridge/webviewRegistry";
import { useAuth } from "../state/AuthContext";
import { useDisplay } from "../state/DisplayContext";

const logger = createConsoleLogger("app-webview");

export type AppWebViewHandle = {
  postToWeb: (message: NativeToWebMessage) => void;
};

type AppWebViewProps = {
  path: string;
};

function toReadyStateMessage(
  token: string | null,
  userId: string | null,
  theme: "light" | "dark",
  fontScale: number,
): NativeToWebMessage[] {
  const baseMessages: NativeToWebMessage[] = [
    {
      v: BRIDGE_VERSION,
      type: "SET_THEME",
      payload: { theme },
    },
    {
      v: BRIDGE_VERSION,
      type: "SET_FONT_SCALE",
      payload: { fontScale },
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
  const { resolvedTheme, fontScale } = useDisplay();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const webViewRef = useRef<WebView | null>(null);
  const hideOverlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiBaseUrl = getApiBaseUrl();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const bootstrapScript = useMemo(() => {
    return buildBootstrapScript({
      auth: session
        ? {
            token: session.token,
            userId: session.userId,
          }
        : null,
      theme: resolvedTheme,
      fontScale,
      appVersion: Constants.expoConfig?.version ?? "1.0.0",
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
  }, [fontScale, resolvedTheme, session]);

  const dispatchFromWeb = useCallback(async (message: WebToNativeMessage): Promise<void> => {
    switch (message.type) {
      case "READY": {
        const syncMessages = toReadyStateMessage(
          session?.token ?? null,
          session?.userId ?? null,
          resolvedTheme,
          fontScale,
        );
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
  }, [fontScale, navigation, resolvedTheme, session?.token, session?.userId, signOut]);

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

  useEffect(() => {
    return () => {
      if (hideOverlayTimeoutRef.current) {
        clearTimeout(hideOverlayTimeoutRef.current);
      }
    };
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

  const clearHideOverlayTimeout = useCallback(() => {
    if (hideOverlayTimeoutRef.current) {
      clearTimeout(hideOverlayTimeoutRef.current);
      hideOverlayTimeoutRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    clearHideOverlayTimeout();
    setLoadProgress(0);
    setShowLoadingOverlay(true);
  }, [clearHideOverlayTimeout]);

  const finishLoading = useCallback(() => {
    clearHideOverlayTimeout();
    setLoadProgress(1);
    hideOverlayTimeoutRef.current = setTimeout(() => {
      setShowLoadingOverlay(false);
      hideOverlayTimeoutRef.current = null;
    }, 150);
  }, [clearHideOverlayTimeout]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: `${apiBaseUrl}${path}` }}
        originWhitelist={originWhitelist}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        scalesPageToFit={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        bounces={false}
        allowsBackForwardNavigationGestures={true}
        injectedJavaScriptBeforeContentLoaded={bootstrapScript}
        onMessage={handleMessage as (event: WebViewMessageEvent) => void}
        onLoadStart={startLoading}
        onLoadEnd={finishLoading}
        onError={finishLoading}
        onLoadProgress={(event) => {
          setLoadProgress(event.nativeEvent.progress);
        }}
      />
      {showLoadingOverlay ? (
        <View
          style={styles.loadingOverlay}
          accessible
          accessibilityLabel="로딩 중"
          accessibilityLiveRegion="polite"
        >
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(5, loadProgress * 100)}%` }]} />
          </View>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.loadingText}>로딩 중</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    gap: 10,
    paddingHorizontal: 24,
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(17, 24, 39, 0.12)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#111827",
  },
  loadingText: {
    fontSize: 13,
    color: "#111827",
  },
});
