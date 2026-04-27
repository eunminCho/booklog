import { Button, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../state/AuthContext";

export function SettingsScreen() {
  const { signOut, isSubmitting } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>placeholder</Text>
      <Button title={isSubmitting ? "로그아웃 중..." : "로그아웃"} onPress={() => void signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#555",
  },
});
