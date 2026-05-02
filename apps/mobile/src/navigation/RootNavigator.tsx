import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

export function RootNavigator() {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (token) {
    return <MainTabs />;
  }

  return <AuthStack />;
}
