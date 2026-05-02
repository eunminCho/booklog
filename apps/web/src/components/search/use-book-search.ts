"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

import type { ExternalApiState } from "@/src/components/errors/ExternalApiError";

import type { BookSummary, SearchApiResponse } from "./search.types";
import { getBookKey, mapErrorCodeToState, mapMockToState } from "./search.utils";

const PAGE_SIZE = 10;

type UseBookSearchParams = {
  initialQuery: string;
  initialMock: string | undefined;
};

type UseBookSearchResult = {
  query: string;
  setQuery: (value: string) => void;
  books: BookSummary[];
  state: ExternalApiState | null;
  didSearch: boolean;
  retryAfterSec: number | undefined;
  isLoadingMore: boolean;
  loadMoreError: boolean;
  loadMoreTriggerRef: MutableRefObject<HTMLDivElement | null>;
  addedBookMap: Record<string, string | null>;
  runSearch: (nextQuery: string) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsAdded: (book: BookSummary, bookId: string | null) => void;
};

export function useBookSearch({ initialQuery, initialMock }: UseBookSearchParams): UseBookSearchResult {
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [state, setState] = useState<ExternalApiState | null>(null);
  const [activeQuery, setActiveQuery] = useState(initialQuery.trim());
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [retryAfterSec, setRetryAfterSec] = useState<number | undefined>(undefined);
  const [didSearch, setDidSearch] = useState(false);
  const [addedBookMap, setAddedBookMap] = useState<Record<string, string | null>>({});
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const forcedState = useMemo(() => {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    return mapMockToState(initialMock);
  }, [initialMock]);

  const runSearch = useCallback(async (nextQuery: string): Promise<void> => {
    setDidSearch(true);
    setRetryAfterSec(undefined);
    setHasMore(false);
    setNextOffset(0);
    setLoadMoreError(false);
    setIsLoadingMore(false);

    if (forcedState) {
      setState(forcedState);
      setBooks([]);
      return;
    }

    const trimmed = nextQuery.trim();
    setActiveQuery(trimmed);
    if (!trimmed) {
      setState(null);
      setBooks([]);
      setAddedBookMap({});
      return;
    }

    setState("loading");
    setBooks([]);

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}&offset=0&limit=${PAGE_SIZE}`);
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
      setHasMore(data?.hasMore ?? false);
      setNextOffset(data?.nextOffset ?? results.length);
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
      setHasMore(false);
      setNextOffset(0);
    }
  }, [forcedState]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!activeQuery || !hasMore || isLoadingMore || state === "loading") {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(activeQuery)}&offset=${nextOffset}&limit=${PAGE_SIZE}`,
      );
      const data = (await response.json().catch(() => null)) as SearchApiResponse | null;

      if (!response.ok) {
        throw new Error("Failed to load more search results");
      }

      const results = data?.books ?? [];
      setBooks((prev) => [...prev, ...results]);
      setHasMore(data?.hasMore ?? false);
      setNextOffset(data?.nextOffset ?? nextOffset + PAGE_SIZE);
      setAddedBookMap((prev) => ({
        ...prev,
        ...Object.fromEntries(
          results
            .filter((book) => Boolean(book.libraryBookId))
            .map((book) => [getBookKey(book), book.libraryBookId ?? null]),
        ),
      }));
    } catch {
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeQuery, hasMore, isLoadingMore, nextOffset, state]);

  const markAsAdded = useCallback((book: BookSummary, bookId: string | null) => {
    const key = getBookKey(book);
    setAddedBookMap((prev) => ({
      ...prev,
      [key]: bookId,
    }));
  }, []);

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
    if (!hasMore || isLoadingMore || state === "loading") {
      return;
    }

    const node = loadMoreTriggerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "220px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore, state]);

  return {
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
  };
}
