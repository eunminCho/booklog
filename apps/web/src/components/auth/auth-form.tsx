"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";
  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "요청을 처리하지 못했습니다.");
        return;
      }

      router.replace("/library");
      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormRoot onSubmit={handleSubmit}>
      <Stack gap={6}>
        <FieldLabel htmlFor={`${mode}-email`}>이메일</FieldLabel>
        <Input
          id={`${mode}-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </Stack>

      <Stack gap={6}>
        <FieldLabel htmlFor={`${mode}-password`}>비밀번호</FieldLabel>
        <Input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </Stack>

      {errorMessage ? (
        <ErrorBox role="alert">
          {errorMessage}
        </ErrorBox>
      ) : null}

      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "처리 중..." : isLogin ? "로그인" : "가입하기"}
      </Button>

      <Text as="p" size="sm" tone="secondary">
        {isLogin ? "계정이 없나요?" : "이미 계정이 있나요?"}{" "}
        <Link href={isLogin ? "/signup" : "/login"} style={{ textDecoration: "underline" }}>
          {isLogin ? "회원가입" : "로그인"}
        </Link>
      </Text>
    </FormRoot>
  );
}

const FormRoot = styled.form({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: 360,
  gap: 16,
});

const FieldLabel = styled.label(({ theme }) => ({
  fontSize: theme.typography.sm,
  fontWeight: 600,
  color: theme.colors.text.primary,
}));

const ErrorBox = styled.p(({ theme }) => ({
  margin: 0,
  borderRadius: theme.radius.md,
  padding: "10px 12px",
  fontSize: theme.typography.sm,
  color: theme.colors.feedback.error,
  backgroundColor: theme.colors.surface.subtle,
  border: `1px solid ${theme.colors.border.subtle}`,
}));
