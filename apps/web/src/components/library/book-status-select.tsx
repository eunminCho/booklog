"use client";

import styled from "@emotion/styled";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Stack } from "@/components/ui/layout";

const statusOptions = [
  { value: "READING", label: "읽는 중" },
  { value: "DONE", label: "완독" },
  { value: "WISHLIST", label: "위시리스트" },
] as const;

type BookStatusValue = (typeof statusOptions)[number]["value"];

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type BookStatusSelectProps = {
  bookId: string;
  initialStatus: BookStatusValue;
};

export function BookStatusSelect({ bookId, initialStatus }: BookStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<BookStatusValue>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStatusChange(nextStatus: BookStatusValue): Promise<void> {
    const previousStatus = status;
    setStatus(nextStatus);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/library/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "상태를 변경하지 못했습니다.");
        setStatus(previousStatus);
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setStatus(previousStatus);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack gap={8}>
      <FieldLabel htmlFor={`book-status-${bookId}`}>상태</FieldLabel>
      <SelectField
        id={`book-status-${bookId}`}
        value={status}
        disabled={isSubmitting}
        onChange={(event) => {
          const nextStatus = event.target.value as BookStatusValue;
          void handleStatusChange(nextStatus);
        }}
        aria-label="서재 상태 변경"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      {errorMessage ? (
        <ErrorBox role="alert">
          {errorMessage}
        </ErrorBox>
      ) : null}
    </Stack>
  );
}

const SelectField = styled.select(({ theme }) => ({
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  color: theme.colors.text.primary,
  padding: "6px 10px",
  fontSize: theme.typography.xs,
  outline: "none",
  "&:focus-visible": {
    borderColor: theme.colors.border.default,
    boxShadow: `0 0 0 2px ${theme.colors.surface.subtle}`,
  },
  "&:disabled": {
    opacity: 0.6,
  },
}));

const FieldLabel = styled.label(({ theme }) => ({
  fontSize: theme.typography.xs,
  fontWeight: 600,
  color: theme.colors.text.secondary,
}));

const ErrorBox = styled.p(({ theme }) => ({
  margin: 0,
  borderRadius: theme.radius.md,
  padding: "8px 10px",
  fontSize: theme.typography.xs,
  color: theme.colors.feedback.error,
  backgroundColor: theme.colors.surface.subtle,
  border: `1px solid ${theme.colors.border.subtle}`,
}));
