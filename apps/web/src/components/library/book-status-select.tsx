"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="space-y-2">
      <label htmlFor={`book-status-${bookId}`} className="text-xs font-medium text-zinc-600 mr-1">
        상태
      </label>
      <select
        id={`book-status-${bookId}`}
        value={status}
        disabled={isSubmitting}
        onChange={(event) => {
          const nextStatus = event.target.value as BookStatusValue;
          void handleStatusChange(nextStatus);
        }}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none ring-blue-300 focus:ring-2 disabled:opacity-60"
        aria-label="서재 상태 변경"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage ? (
        <p role="alert" className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
