"use client";

import type { MutableRefObject } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Inline, Stack, Surface } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { AddToLibraryButton } from "@/src/components/library/add-to-library-button";

import type { BookSummary } from "./search.types";
import { getBookKey } from "./search.utils";

type SearchResultsListProps = {
  books: BookSummary[];
  addedBookMap: Record<string, string | null>;
  isLoadingMore: boolean;
  loadMoreError: boolean;
  loadMoreTriggerRef: MutableRefObject<HTMLDivElement | null>;
  onAdded: (book: BookSummary, bookId: string | null) => void;
  onLoadMoreRetry: () => void;
  onShowAddedToast: () => void;
};

export function SearchResultsList({
  books,
  addedBookMap,
  isLoadingMore,
  loadMoreError,
  loadMoreTriggerRef,
  onAdded,
  onLoadMoreRetry,
  onShowAddedToast,
}: SearchResultsListProps) {
  return (
    <Stack gap={12}>
      {books.map((book, index) => (
        <Card key={`${getBookKey(book)}-${index}`}>
          <CardContent style={{ padding: 16 }}>
            <Inline align="flex-start" justify="space-between" gap={16}>
              <div>
                <Text as="p" size="lg" weight={700}>
                  {book.title}
                </Text>
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
                    onAdded(book, bookId);
                    onShowAddedToast();
                  }}
                  onAlreadyInLibrary={(bookId) => {
                    onAdded(book, bookId);
                  }}
                />
              )}
            </Inline>
          </CardContent>
        </Card>
      ))}

      {isLoadingMore ? (
        <Stack gap={12}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={`search-skeleton-${index}`}>
              <CardContent style={{ padding: 16 }}>
                <Stack gap={8}>
                  <Skeleton style={{ height: 18, width: "42%" }} />
                  <Skeleton style={{ height: 14, width: "60%" }} />
                  <Skeleton style={{ height: 28, width: 120 }} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : null}

      {loadMoreError ? (
        <Surface style={{ textAlign: "center", padding: 16 }}>
          <Text as="p" size="sm" tone="secondary" style={{ marginBottom: 8 }}>
            검색 결과를 더 불러오지 못했습니다.
          </Text>
          <Button type="button" variant="outline" size="sm" onClick={onLoadMoreRetry}>
            다시 시도
          </Button>
        </Surface>
      ) : null}

      <div ref={loadMoreTriggerRef} aria-hidden="true" style={{ height: 1 }} />
    </Stack>
  );
}
