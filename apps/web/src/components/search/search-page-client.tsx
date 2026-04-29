"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  libraryBookId?: string | null;
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addedBookMap, setAddedBookMap] = useState<Record<string, string | null>>({});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setAddedBookMap(
        Object.fromEntries(
          results
            .filter((book) => Boolean(book.libraryBookId))
            .map((book) => [getBookKey(book), book.libraryBookId ?? null]),
        ),
      );
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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmed = query.trim();
    const search = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    router.replace(`/search${search}`);
    await runSearch(trimmed);
  }

  const showAddedToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage("내 서재에 추가되었습니다.");
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2200);
  }, []);

  const markAsAdded = useCallback((book: BookSummary, bookId: string | null) => {
    const key = getBookKey(book);
    setAddedBookMap((prev) => ({
      ...prev,
      [key]: bookId,
    }));
  }, []);

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
                {addedBookMap[getBookKey(book)] !== undefined ? (
                  <Button asChild variant="outline">
                    <Link href={addedBookMap[getBookKey(book)] ? `/library/${addedBookMap[getBookKey(book)]}` : "/library"}>
                      서재로 이동
                    </Link>
                  </Button>
                ) : (
                  <AddToLibraryButton
                    book={book}
                    redirectOnSuccess={false}
                    onSuccess={(bookId) => {
                      markAsAdded(book, bookId);
                      showAddedToast();
                    }}
                    onAlreadyInLibrary={(bookId) => {
                      markAsAdded(book, bookId);
                    }}
                  />
                )}
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      {!didSearch ? (
        <p className="text-center text-sm text-zinc-500">검색어를 입력하면 결과가 표시됩니다.</p>
      ) : null}
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <p
            role="status"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
          >
            {toastMessage}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function getBookKey(book: BookSummary): string {
  return `${book.isbn ?? "no-isbn"}-${book.title}`;
}
