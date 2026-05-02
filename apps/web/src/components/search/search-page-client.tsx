"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BRIDGE_VERSION, postToNative } from "@booklog/bridge";
import styled from "@emotion/styled";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Container, Inline, Stack, Surface } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/components/ui/text";
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
    postToNative({
      v: BRIDGE_VERSION,
      type: "LOG",
      payload: {
        level: "info",
        message: "WEB_ROUTE_LOADING",
        context: { loading: true },
      },
    });
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
    <Container>
      <Stack gap={24}>
        <Surface>
          <Heading level={1}>책 검색</Heading>
          <Text size="sm" tone="secondary" style={{ marginTop: 6 }}>
            Google Books로 책을 검색하고 내 서재에 추가하세요.
          </Text>
          <SearchForm onSubmit={handleSubmit}>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="책 제목, 저자, ISBN"
              style={{ width: "100%", fontSize: "1rem" }}
            />
            <Button type="submit">검색</Button>
          </SearchForm>
        </Surface>

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
              <CardTitle style={{ fontSize: "1.125rem" }}>검색 결과 준비 중</CardTitle>
              <CardDescription>외부 API 응답을 기다리고 있습니다.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton style={{ height: 16, width: "50%" }} />
              <Skeleton style={{ height: 16, width: "66%" }} />
              <Skeleton style={{ height: 36, width: 112 }} />
            </CardContent>
          </Card>
        ) : null}

        {!state && books.length > 0 ? (
          <Stack gap={12}>
            {books.map((book) => (
              <Card key={`${book.isbn ?? "no-isbn"}-${book.title}`}>
                <CardContent style={{ padding: 16 }}>
                  <Inline align="flex-start" justify="space-between" gap={16}>
                    <div>
                      <Text as="p" size="lg" weight={700}>{book.title}</Text>
                      <Text as="p" size="sm" tone="secondary" style={{ marginTop: 6 }}>
                        {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
                      </Text>
                      {book.isbn ? (
                        <div style={{ marginTop: 6 }}>
                          <Badge variant="secondary">ISBN {book.isbn}</Badge>
                        </div>
                      ) : null}
                    </div>
                    {addedBookMap[getBookKey(book)] !== undefined ? (
                      <ButtonLink
                        href={addedBookMap[getBookKey(book)] ? `/library/${addedBookMap[getBookKey(book)]}` : "/library"}
                        variant="outline"
                      >
                        서재로 이동
                      </ButtonLink>
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
                  </Inline>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : null}

        {!didSearch ? (
          <Text as="p" size="sm" tone="muted" style={{ textAlign: "center" }}>
            검색어를 입력하면 결과가 표시됩니다.
          </Text>
        ) : null}
        {toastMessage ? (
          <ToastWrap>
            <ToastText role="status">{toastMessage}</ToastText>
          </ToastWrap>
        ) : null}
      </Stack>
    </Container>
  );
}

const ToastWrap = styled.div({
  pointerEvents: "none",
  position: "fixed",
  insetInline: 0,
  bottom: 24,
  zIndex: 50,
  display: "flex",
  justifyContent: "center",
  paddingInline: 16,
});

const ToastText = styled.p(({ theme }) => ({
  margin: 0,
  borderRadius: 999,
  backgroundColor: theme.colors.surface.inverse,
  color: theme.colors.text.inverse,
  padding: "8px 16px",
  fontSize: theme.typography.sm,
  fontWeight: 600,
  boxShadow: theme.shadow.lg,
}));

const SearchForm = styled.form({
  marginTop: 16,
  display: "flex",
  gap: 8,
});

function getBookKey(book: BookSummary): string {
  return `${book.isbn ?? "no-isbn"}-${book.title}`;
}
