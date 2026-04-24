import { Button, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../state/AuthContext";

export function LoginScreen() {
  const { setToken } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login (Mock)</Text>
      <Text style={styles.subtitle}>로그인 구현은 다음 Phase에서 연결 예정</Text>
      <Button title="Mock Login" onPress={() => setToken("dummy")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#555",
  },
});
