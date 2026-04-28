import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { LibraryScreen } from "../screens/tabs/LibraryScreen";
import { ScanScreen } from "../screens/tabs/ScanScreen";
import { SettingsScreen } from "../screens/tabs/SettingsScreen";

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="Library">
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
