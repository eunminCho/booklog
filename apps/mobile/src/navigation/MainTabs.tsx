import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { LibraryScreen } from "../screens/tabs/LibraryScreen";
import { ScanScreen } from "../screens/tabs/ScanScreen";
import { SettingsScreen } from "../screens/tabs/SettingsScreen";

export type MainTabParamList = {
  Library:
    | {
        searchQuery?: string;
        openSearch?: boolean;
        searchRequestId?: string;
      }
    | undefined;
  Scan: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="Library">
      <Tab.Screen name="Library" options={{ headerShown: false }} component={LibraryScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
