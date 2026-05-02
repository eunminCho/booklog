"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BRIDGE_VERSION, postToNative } from "@booklog/bridge";
import styled from "@emotion/styled";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container, Stack, Surface } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
import { ExternalApiError } from "@/src/components/errors/ExternalApiError";

import { SearchLoadingCard } from "./search-loading-card";
import { SearchResultsList } from "./search-results-list";
import { useBookSearch } from "./use-book-search";

type SearchPageClientProps = {
  initialQuery: string;
  initialMock: string | undefined;
};

export function SearchPageClient({ initialQuery, initialMock }: SearchPageClientProps) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    query,
    setQuery,
    books,
    state,
    didSearch,
    retryAfterSec,
    isLoadingMore,
    loadMoreError,
    loadMoreTriggerRef,
    addedBookMap,
    runSearch,
    loadMore,
    markAsAdded,
  } = useBookSearch({ initialQuery, initialMock });

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

        {state === "loading" ? <SearchLoadingCard /> : null}

        {!state && books.length > 0 ? (
          <SearchResultsList
            books={books}
            addedBookMap={addedBookMap}
            isLoadingMore={isLoadingMore}
            loadMoreError={loadMoreError}
            loadMoreTriggerRef={loadMoreTriggerRef}
            onAdded={markAsAdded}
            onShowAddedToast={showAddedToast}
            onLoadMoreRetry={() => {
              void loadMore();
            }}
          />
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
