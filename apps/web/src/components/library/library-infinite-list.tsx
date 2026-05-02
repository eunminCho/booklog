"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BookStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Inline, Stack, Surface } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

type LibraryTab = "all" | "reading" | "done" | "wishlist";

type LibraryBook = {
  id: string;
  title: string;
  authors: string[];
  status: BookStatus;
  _count: {
    notes: number;
  };
};

type LibraryInfiniteListProps = {
  tab: LibraryTab;
  initialBooks: LibraryBook[];
  initialHasMore: boolean;
  pageSize: number;
};

type LibraryListResponse = {
  books?: LibraryBook[];
  hasMore?: boolean;
  nextOffset?: number;
};

export function LibraryInfiniteList({
  tab,
  initialBooks,
  initialHasMore,
  pageSize,
}: LibraryInfiniteListProps) {
  const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState(initialBooks.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const response = await fetch(
        `/api/library?tab=${encodeURIComponent(tab)}&offset=${nextOffset}&limit=${pageSize}`,
      );
      const data = (await response.json().catch(() => null)) as LibraryListResponse | null;

      if (!response.ok) {
        throw new Error("Failed to load more books");
      }

      const nextBooks = data?.books ?? [];
      setBooks((prev) => [...prev, ...nextBooks]);
      setHasMore(data?.hasMore ?? false);
      setNextOffset(data?.nextOffset ?? nextOffset + nextBooks.length);
    } catch {
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextOffset, pageSize, tab]);

  useEffect(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const node = triggerRef.current;
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
  }, [hasMore, isLoadingMore, loadMore]);

  if (books.length === 0) {
    return (
      <Surface style={{ textAlign: "center", padding: 32 }}>
        <Text size="sm" tone="secondary">조건에 맞는 책이 없습니다.</Text>
      </Surface>
    );
  }

  return (
    <Stack gap={12}>
      {books.map((book) => (
        <Link key={book.id} href={`/library/${book.id}`} style={{ display: "block" }}>
          <Card>
            <CardContent style={{ padding: 16 }}>
              <Inline gap={16} align="flex-start" justify="space-between">
                <div>
                  <Text as="p" size="lg" weight={700}>{book.title}</Text>
                  <Text as="p" size="sm" tone="secondary" style={{ marginTop: 6 }}>
                    {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
                  </Text>
                  <Text as="p" size="xs" tone="muted" style={{ marginTop: 8 }}>
                    노트 {book._count.notes}개
                  </Text>
                </div>
                <Badge variant="secondary">{book.status}</Badge>
              </Inline>
            </CardContent>
          </Card>
        </Link>
      ))}

      {isLoadingMore ? (
        <Stack gap={12}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={`library-skeleton-${index}`}>
              <CardContent style={{ padding: 16 }}>
                <Stack gap={8}>
                  <Skeleton style={{ height: 18, width: "42%" }} />
                  <Skeleton style={{ height: 14, width: "60%" }} />
                  <Skeleton style={{ height: 12, width: "25%" }} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : null}

      {loadMoreError ? (
        <Surface style={{ textAlign: "center", padding: 16 }}>
          <Text as="p" size="sm" tone="secondary" style={{ marginBottom: 8 }}>
            목록을 더 불러오지 못했습니다.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadMore()}>
            다시 시도
          </Button>
        </Surface>
      ) : null}

      <div ref={triggerRef} aria-hidden="true" style={{ height: 1 }} />
    </Stack>
  );
}
