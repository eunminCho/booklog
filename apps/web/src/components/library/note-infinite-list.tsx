"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Stack, Surface } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";

type NoteItem = {
  id: string;
  content: string;
  createdAt: string;
};

type NoteListResponse = {
  notes?: NoteItem[];
  hasMore?: boolean;
  nextOffset?: number;
};

type NoteInfiniteListProps = {
  bookId: string;
  initialNotes: NoteItem[];
  initialHasMore: boolean;
  pageSize: number;
};

export function NoteInfiniteList({ bookId, initialNotes, initialHasMore, pageSize }: NoteInfiniteListProps) {
  const [notes, setNotes] = useState<NoteItem[]>(() => dedupeNotesById(initialNotes));
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState(initialNotes.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const isRequestInFlightRef = useRef(false);

  useEffect(() => {
    setNotes(dedupeNotesById(initialNotes));
    setHasMore(initialHasMore);
    setNextOffset(initialNotes.length);
    setIsLoadingMore(false);
    setLoadMoreError(false);
    isRequestInFlightRef.current = false;
  }, [bookId, initialHasMore, initialNotes]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || isLoadingMore || isRequestInFlightRef.current) {
      return;
    }

    isRequestInFlightRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const response = await fetch(
        `/api/library/${bookId}/notes?offset=${nextOffset}&limit=${pageSize}`,
      );
      const data = (await response.json().catch(() => null)) as NoteListResponse | null;

      if (!response.ok) {
        throw new Error("Failed to load more notes");
      }

      const nextNotes = data?.notes ?? [];
      setNotes((prev) => dedupeNotesById([...prev, ...nextNotes]));
      setHasMore(data?.hasMore ?? false);
      setNextOffset(data?.nextOffset ?? nextOffset + nextNotes.length);
    } catch {
      setLoadMoreError(true);
    } finally {
      isRequestInFlightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [bookId, hasMore, isLoadingMore, nextOffset, pageSize]);

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

  if (notes.length === 0) {
    return (
      <Surface style={{ padding: 24 }}>
        <Text size="sm" tone="secondary">아직 작성된 노트가 없습니다.</Text>
      </Surface>
    );
  }

  return (
    <Stack gap={12}>
      {notes.map((note) => (
        <Card key={note.id}>
          <CardContent style={{ padding: 16 }}>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{note.content}</Text>
            <Text size="xs" tone="muted" style={{ marginTop: 8 }}>
              {new Date(note.createdAt).toLocaleString()}
            </Text>
          </CardContent>
        </Card>
      ))}

      {isLoadingMore ? (
        <Stack gap={12}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={`note-skeleton-${index}`}>
              <CardContent style={{ padding: 16 }}>
                <Stack gap={8}>
                  <Skeleton style={{ height: 14, width: "85%" }} />
                  <Skeleton style={{ height: 14, width: "65%" }} />
                  <Skeleton style={{ height: 12, width: "28%" }} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : null}

      {loadMoreError ? (
        <Surface style={{ textAlign: "center", padding: 16 }}>
          <Text as="p" size="sm" tone="secondary" style={{ marginBottom: 8 }}>
            노트를 더 불러오지 못했습니다.
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

function dedupeNotesById(items: NoteItem[]): NoteItem[] {
  const map = new Map<string, NoteItem>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}
