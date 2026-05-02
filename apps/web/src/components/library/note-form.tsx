"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";

import { Button } from "@/components/ui/button";
import { Stack, Surface } from "@/components/ui/layout";

type NoteFormProps = {
  bookId: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function NoteForm({ bookId }: NoteFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMessage("노트 내용을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/library/${bookId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "노트를 저장하지 못했습니다.");
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Surface as="form" onSubmit={handleSubmit}>
      <Stack gap={8}>
        <FieldLabel htmlFor="new-note">노트 추가</FieldLabel>
        <NoteTextArea
          id="new-note"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          placeholder="읽으면서 남길 메모를 입력하세요."
        />
      </Stack>
      {errorMessage ? (
        <ErrorBox role="alert" style={{ marginTop: 8 }}>
          {errorMessage}
        </ErrorBox>
      ) : null}
      <Button type="submit" disabled={isSubmitting} style={{ marginTop: 12 }}>
        {isSubmitting ? "저장 중..." : "노트 저장"}
      </Button>
    </Surface>
  );
}

const NoteTextArea = styled.textarea(({ theme }) => ({
  width: "100%",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  color: theme.colors.text.primary,
  padding: "10px 12px",
  fontSize: theme.typography.body,
  outline: "none",
  resize: "vertical",
  "&:focus-visible": {
    borderColor: theme.colors.border.default,
    boxShadow: `0 0 0 2px ${theme.colors.surface.subtle}`,
  },
  "&::placeholder": {
    color: theme.colors.text.muted,
  },
}));

const ErrorBox = styled.p(({ theme }) => ({
  margin: 0,
  borderRadius: theme.radius.md,
  padding: "8px 10px",
  fontSize: theme.typography.sm,
  color: theme.colors.feedback.error,
  backgroundColor: theme.colors.surface.subtle,
  border: `1px solid ${theme.colors.border.subtle}`,
}));

const FieldLabel = styled.label(({ theme }) => ({
  fontSize: theme.typography.sm,
  fontWeight: 600,
  color: theme.colors.text.primary,
}));
