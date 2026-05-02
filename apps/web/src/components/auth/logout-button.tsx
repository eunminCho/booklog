"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRIDGE_VERSION, postToNative } from "@booklog/bridge";
import styled from "@emotion/styled";

import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/layout";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function LogoutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout(): Promise<void> {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "로그아웃에 실패했습니다.");
        return;
      }

      postToNative({
        v: BRIDGE_VERSION,
        type: "REQUEST_LOGOUT",
      });
      router.replace("/login");
      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack style={{ width: "100%", maxWidth: 360 }} gap={16}>
      {errorMessage ? (
        <ErrorBox role="alert">
          {errorMessage}
        </ErrorBox>
      ) : null}
      <Button type="button" onClick={handleLogout} disabled={isSubmitting} fullWidth>
        {isSubmitting ? "처리 중..." : "로그아웃"}
      </Button>
    </Stack>
  );
}

const ErrorBox = styled.p(({ theme }) => ({
  margin: 0,
  borderRadius: theme.radius.md,
  padding: "10px 12px",
  fontSize: theme.typography.sm,
  color: theme.colors.feedback.error,
  backgroundColor: theme.colors.surface.subtle,
  border: `1px solid ${theme.colors.border.subtle}`,
}));
