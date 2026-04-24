import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useAuth } from "../state/AuthContext";

export function RootNavigator() {
  const { token } = useAuth();

  if (token) {
    return <MainTabs />;
  }

  return <AuthStack />;
}
