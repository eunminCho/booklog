"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <label htmlFor="new-note" className="text-sm font-medium">
        노트 추가
      </label>
      <textarea
        id="new-note"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none ring-blue-300 focus:ring-2"
        placeholder="읽으면서 남길 메모를 입력하세요."
      />
      {errorMessage ? (
        <p role="alert" className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="mt-3">
        {isSubmitting ? "저장 중..." : "노트 저장"}
      </Button>
    </form>
  );
}
