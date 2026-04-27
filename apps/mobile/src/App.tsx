import type { BridgeMessageVersion } from "@booklog/bridge";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./navigation/RootNavigator";
import { AuthProvider } from "./state/AuthContext";
import { DisplayProvider, useDisplay } from "./state/DisplayContext";

void ((version: BridgeMessageVersion) => version)(1);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DisplayProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </DisplayProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { resolvedTheme } = useDisplay();

  return (
    <NavigationContainer
      theme={resolvedTheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme}
    >
      <RootNavigator />
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
    </NavigationContainer>
  );
}
