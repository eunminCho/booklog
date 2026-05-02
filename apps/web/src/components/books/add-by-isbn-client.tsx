"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ExternalApiError, type ExternalApiState } from "@/src/components/errors/ExternalApiError";
import { AddToLibraryButton } from "@/src/components/library/add-to-library-button";

type BookSummary = {
  isbn: string | null;
  title: string;
  authors: string[];
  thumbnail: string | null;
};

type IsbnResponse = {
  book?: BookSummary;
  error?: {
    code?: string;
  };
};

type AddByIsbnClientProps = {
  isbn: string;
};

function mapErrorCodeToState(code: string | undefined): ExternalApiState {
  if (code === "EXTERNAL_RATE_LIMITED") {
    return "rateLimit";
  }
  if (code === "EXTERNAL_UPSTREAM") {
    return "upstream";
  }
  if (code === "EXTERNAL_NOT_FOUND") {
    return "notFound";
  }
  if (code === "EXTERNAL_OFFLINE") {
    return "offline";
  }

  return "upstream";
}

export function AddByIsbnClient({ isbn }: AddByIsbnClientProps) {
  const [book, setBook] = useState<BookSummary | null>(null);
  const [state, setState] = useState<ExternalApiState>("loading");
  const [retryAfterSec, setRetryAfterSec] = useState<number | undefined>(undefined);

  const fetchByIsbn = useCallback(async (): Promise<void> => {
    setState("loading");
    setBook(null);
    setRetryAfterSec(undefined);

    try {
      const response = await fetch(`/api/books/isbn/${encodeURIComponent(isbn)}`);
      const data = (await response.json().catch(() => null)) as IsbnResponse | null;

      if (!response.ok) {
        const mapped = mapErrorCodeToState(data?.error?.code);
        setState(mapped);
        if (mapped === "rateLimit") {
          const header = response.headers.get("retry-after");
          const parsed = header ? Number.parseInt(header, 10) : NaN;
          setRetryAfterSec(Number.isFinite(parsed) && parsed > 0 ? parsed : undefined);
        }
        return;
      }

      if (!data?.book) {
        setState("notFound");
        return;
      }

      setBook(data.book);
      setState("loading");
    } catch {
      setState("offline");
    }
  }, [isbn]);

  useEffect(() => {
    void fetchByIsbn();
  }, [fetchByIsbn]);

  if (book) {
    return (
      <Card>
        <CardHeader>
          <Badge variant="secondary" style={{ width: "fit-content" }}>
            ISBN {isbn}
          </Badge>
          <CardTitle style={{ marginTop: 6 }}>{book.title}</CardTitle>
          <Text size="sm" tone="secondary">
            {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
          </Text>
        </CardHeader>
        <CardContent>
          <AddToLibraryButton book={book} />
        </CardContent>
      </Card>
    );
  }

  return <ExternalApiError state={state} retryAfterSec={retryAfterSec} onRetry={() => void fetchByIsbn()} />;
}
