import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput } from "react-native";

import { useAuth } from "../../state/AuthContext";

export function LoginScreen() {
  const { signIn, error, clearError, isSubmitting } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignIn(): Promise<void> {
    clearError();
    try {
      await signIn(email.trim(), password);
    } catch {
      // 메시지는 AuthContext에서 관리한다.
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 }}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        style={styles.input}
        />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={isSubmitting ? "로그인 중..." : "로그인"} onPress={() => void handleSignIn()} />
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  error: {
    width: "100%",
    color: "#b91c1c",
  },
});
