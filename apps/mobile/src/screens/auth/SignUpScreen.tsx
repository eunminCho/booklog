import { useState } from "react";
import { getColorTokens } from "@booklog/design-tokens";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { useDisplay } from "../../hooks/useDisplay";

export function SignUpScreen() {
  const { signUp, error, clearError, isSubmitting } = useAuth();
  const { resolvedTheme } = useDisplay();
  const colors = getColorTokens(resolvedTheme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignUp(): Promise<void> {
    clearError();
    try {
      await signUp(email.trim(), password);
    } catch {
      // 메시지는 AuthContext에서 관리한다.
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.canvas }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>회원가입</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        style={[
          styles.input,
          {
            borderColor: colors.border.subtle,
            backgroundColor: colors.surface.default,
            color: colors.text.primary,
          },
        ]}
        placeholderTextColor={colors.text.muted}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호(8자 이상)"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            borderColor: colors.border.subtle,
            backgroundColor: colors.surface.default,
            color: colors.text.primary,
          },
        ]}
        placeholderTextColor={colors.text.muted}
      />
      {error ? <Text style={[styles.error, { color: colors.feedback.error }]}>{error}</Text> : null}
      <Button
        title={isSubmitting ? "가입 중..." : "가입하기"}
        onPress={() => void handleSignUp()}
      />
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    width: "100%",
  },
});
