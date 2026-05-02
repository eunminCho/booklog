import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

type RootNavigatorProps = {
  onInitialLibraryLoadEnd?: () => void;
};

export function RootNavigator({ onInitialLibraryLoadEnd }: RootNavigatorProps) {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (token) {
    return <MainTabs onInitialLibraryLoadEnd={onInitialLibraryLoadEnd} />;
  }

  return <AuthStack />;
}
