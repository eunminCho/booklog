"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type AddToLibraryButtonProps = {
  book: {
    isbn: string | null;
    title: string;
    authors: string[];
    thumbnail: string | null;
  };
  label?: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function AddToLibraryButton({ book, label = "서재에 추가" }: AddToLibraryButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          status: "WISHLIST",
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "서재에 추가하지 못했습니다.");
        return;
      }

      router.push("/library");
      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "추가 중..." : label}
      </Button>
      {errorMessage ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
