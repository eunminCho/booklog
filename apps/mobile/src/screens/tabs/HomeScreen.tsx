import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";

export function HomeScreen() {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? "unknown";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>WebView placeholder</Text>
      <Text style={styles.url}>API: {String(apiBaseUrl)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#555",
  },
  url: {
    color: "#777",
    fontSize: 12,
  },
});
