"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalApiError, type ExternalApiState } from "@/src/components/errors/ExternalApiError";
import { AddToLibraryButton } from "@/src/components/library/add-to-library-button";

type BookSummary = {
  isbn: string | null;
  title: string;
  authors: string[];
  thumbnail: string | null;
};

type SearchApiResponse = {
  books?: BookSummary[];
  error?: {
    code?: string;
  };
};

type SearchPageClientProps = {
  initialQuery: string;
  initialMock: string | undefined;
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

function mapMockToState(mock: string | undefined): ExternalApiState | null {
  if (mock === "loading") {
    return "loading";
  }
  if (mock === "empty") {
    return "empty";
  }
  if (mock === "offline") {
    return "offline";
  }
  if (mock === "rateLimit") {
    return "rateLimit";
  }
  if (mock === "upstream") {
    return "upstream";
  }
  if (mock === "notFound") {
    return "notFound";
  }

  return null;
}

export function SearchPageClient({ initialQuery, initialMock }: SearchPageClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [state, setState] = useState<ExternalApiState | null>(null);
  const [retryAfterSec, setRetryAfterSec] = useState<number | undefined>(undefined);
  const [didSearch, setDidSearch] = useState(false);

  const forcedState = useMemo(() => {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    return mapMockToState(initialMock);
  }, [initialMock]);

  const runSearch = useCallback(async (nextQuery: string): Promise<void> => {
    setDidSearch(true);
    setRetryAfterSec(undefined);

    if (forcedState) {
      if (forcedState === "loading") {
        setState("loading");
        setBooks([]);
        return;
      }

      setState(forcedState);
      setBooks([]);
      return;
    }

    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setState(null);
      setBooks([]);
      return;
    }

    setState("loading");
    setBooks([]);

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}`);
      const data = (await response.json().catch(() => null)) as SearchApiResponse | null;

      if (!response.ok) {
        const mapped = mapErrorCodeToState(data?.error?.code);
        setRetryAfterSec(
          mapped === "rateLimit" ? Number.parseInt(response.headers.get("retry-after") ?? "", 10) : undefined,
        );
        setState(mapped);
        return;
      }

      const results = data?.books ?? [];
      setBooks(results);
      setState(results.length === 0 ? "empty" : null);
    } catch {
      setState("offline");
      setBooks([]);
    }
  }, [forcedState]);

  useEffect(() => {
    if (initialQuery.trim()) {
      void runSearch(initialQuery);
      return;
    }

    if (forcedState) {
      setDidSearch(true);
      setState(forcedState);
    }
  }, [forcedState, initialQuery, runSearch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmed = query.trim();
    const search = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    router.replace(`/search${search}`);
    await runSearch(trimmed);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">책 검색</h1>
        <p className="mt-1 text-sm text-zinc-700">Google Books로 책을 검색하고 내 서재에 추가하세요.</p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="책 제목, 저자, ISBN"
            className="w-full text-base"
          />
          <Button type="submit">
            검색
          </Button>
        </form>
      </section>

      {state && state !== "loading" ? (
        <ExternalApiError
          state={state}
          retryAfterSec={retryAfterSec}
          onRetry={() => {
            void runSearch(query);
          }}
        />
      ) : null}

      {state === "loading" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">검색 결과 준비 중</CardTitle>
            <CardDescription>외부 API 응답을 기다리고 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-9 w-28" />
          </CardContent>
        </Card>
      ) : null}

      {!state && books.length > 0 ? (
        <section className="grid gap-3">
          {books.map((book) => (
            <Card
              key={`${book.isbn ?? "no-isbn"}-${book.title}`}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{book.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
                  </p>
                  {book.isbn ? (
                    <div className="mt-1">
                      <Badge variant="secondary">ISBN {book.isbn}</Badge>
                    </div>
                  ) : null}
                </div>
                <AddToLibraryButton book={book} />
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      {!didSearch ? (
        <p className="text-center text-sm text-zinc-500">검색어를 입력하면 결과가 표시됩니다.</p>
      ) : null}
    </div>
  );
}
