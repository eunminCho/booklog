import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "../components/Icon/Icon";
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

const TAB_ICON_SRC_BY_ROUTE: Record<keyof MainTabParamList, "book" | "scan" | "settings"> = {
  Library: "book",
  Scan: "scan",
  Settings: "settings",
};

type MainTabsProps = {
  onInitialLibraryLoadEnd?: () => void;
};

export function MainTabs({ onInitialLibraryLoadEnd }: MainTabsProps) {
  return (
    <Tab.Navigator
      initialRouteName="Library"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Icon
            src={TAB_ICON_SRC_BY_ROUTE[route.name as keyof MainTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Library" options={{ headerShown: false }}>
        {(props) => (
          <LibraryScreen {...props} onInitialWebViewLoadEnd={onInitialLibraryLoadEnd} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
