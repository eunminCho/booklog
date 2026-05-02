import { useState } from "react";
import { getColorTokens } from "@booklog/design-tokens";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, ScrollView, StyleSheet, Text, TextInput } from "react-native";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { useAuth } from "../../hooks/useAuth";
import { useDisplay } from "../../hooks/useDisplay";

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "Login">>();
  const { signIn, error, clearError, isSubmitting } = useAuth();
  const { resolvedTheme } = useDisplay();
  const colors = getColorTokens(resolvedTheme);
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
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        gap: 12,
        backgroundColor: colors.surface.canvas,
      }}
    >
      <Text style={[styles.title, { color: colors.text.primary }]}>로그인</Text>
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
        placeholder="비밀번호"
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
      <Button title={isSubmitting ? "로그인 중..." : "로그인"} onPress={() => void handleSignIn()} />
      <Button title="회원가입 하러가기" onPress={() => navigation.navigate("SignUp")} />
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    width: "100%",
  },
});
