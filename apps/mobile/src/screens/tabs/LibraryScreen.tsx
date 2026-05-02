import { useMemo } from "react";
import { View } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppWebView } from "../../components/AppWebView";
import type { MainTabParamList } from "../../navigation/MainTabs";

type LibraryScreenProps = {
  onInitialWebViewLoadEnd?: () => void;
};

export function LibraryScreen({ onInitialWebViewLoadEnd }: LibraryScreenProps) {
  const route = useRoute<RouteProp<MainTabParamList, "Library">>();
  const { top: safeAreaTopInset } = useSafeAreaInsets();

  const webPath = useMemo(() => {
    const searchQuery = route.params?.searchQuery?.trim();
    if (searchQuery) {
      return `/search?q=${encodeURIComponent(searchQuery)}`;
    }
    if (route.params?.openSearch) {
      return "/search";
    }
    return "/library";
  }, [route.params?.openSearch, route.params?.searchQuery]);

  return (
    <View style={{ paddingTop: safeAreaTopInset, flex: 1 }}>
      <AppWebView
        path={webPath}
        key={route.params?.searchRequestId ?? "library-default"}
        onInitialLoadEnd={onInitialWebViewLoadEnd}
      />
    </View>
  );
}
