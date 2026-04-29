import {  useSafeAreaInsets } from "react-native-safe-area-context";
import { AppWebView } from "../../components/AppWebView";
import { View } from "react-native";

export function LibraryScreen() {

  const { top : safeAreaTopInset } = useSafeAreaInsets()

  return <View style={{ paddingTop: safeAreaTopInset, flex: 1,}}>
    <AppWebView path="/library" />
  </View>;
}
