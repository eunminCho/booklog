import type { BridgeMessageVersion } from "@booklog/bridge";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useDisplay } from "./hooks/useDisplay";
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthProvider } from "./state/authContext/AuthContext";
import { DisplayProvider } from "./state/displayContext/DisplayContext";

void ((version: BridgeMessageVersion) => version)(1);

export default function App() {
  return (
    <SafeAreaProvider>
      <DisplayProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </DisplayProvider>
    </SafeAreaProvider>
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
