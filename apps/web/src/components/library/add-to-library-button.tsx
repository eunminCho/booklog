"use client";

import styled from "@emotion/styled";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";

type AddToLibraryButtonProps = {
  book: {
    isbn: string | null;
    title: string;
    authors: string[];
    thumbnail: string | null;
  };
  label?: string;
  redirectOnSuccess?: boolean;
  onSuccess?: (bookId: string | null) => void;
  onAlreadyInLibrary?: (bookId: string | null) => void;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
  bookId?: string;
};

type ApiSuccessResponse = {
  book?: {
    id?: string;
  };
};

const statusOptions = [
  { value: "READING", label: "읽는 중" },
  { value: "DONE", label: "완독" },
  { value: "WISHLIST", label: "위시리스트" },
] as const;

type BookStatusValue = (typeof statusOptions)[number]["value"];

export function AddToLibraryButton({
  book,
  label = "서재에 추가",
  redirectOnSuccess = true,
  onSuccess,
  onAlreadyInLibrary,
}: AddToLibraryButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<BookStatusValue>("WISHLIST");

  async function handleClick(): Promise<void> {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isbn: book.isbn,
          title: book.title,
          authors: book.authors,
          thumbnail: book.thumbnail,
          status,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        if (response.status === 409 && data?.error?.code === "FORBIDDEN") {
          onAlreadyInLibrary?.(data.bookId ?? null);
          return;
        }
        setErrorMessage(data?.error?.message ?? "서재에 추가하지 못했습니다.");
        return;
      }

      const data = (await response.json().catch(() => null)) as ApiSuccessResponse | null;

      if (redirectOnSuccess) {
        router.push("/library");
        router.refresh();
      }
      onSuccess?.(data?.book?.id ?? null);
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack gap={8}>
      <Stack gap={6}>
        <Text as="span" size="xs" tone="secondary">
          상태
        </Text>
        <SelectField
          value={status}
          onChange={(event) => setStatus(event.target.value as BookStatusValue)}
          disabled={isSubmitting}
          aria-label="서재 상태 선택"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Stack>
      <Button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? "추가 중..." : label}
      </Button>
      {errorMessage ? (
        <ErrorBox role="alert">
          {errorMessage}
        </ErrorBox>
      ) : null}
    </Stack>
  );
}

const SelectField = styled.select(({ theme }) => ({
  width: "100%",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  color: theme.colors.text.primary,
  padding: "8px 12px",
  fontSize: theme.typography.sm,
  outline: "none",
  "&:focus-visible": {
    borderColor: theme.colors.border.default,
    boxShadow: `0 0 0 2px ${theme.colors.surface.subtle}`,
  },
  "&:disabled": {
    opacity: 0.6,
  },
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
